'use client'

import { useLayercodeAgent } from '@layercode/react-sdk'
import { useState, useRef, useEffect } from 'react'

interface UseSimpleLayercodeVoiceOptions {
  metadata?: Record<string, any>
  onDataMessage?: (data: any) => void
  onIdleTimeout?: () => void
}

// Idle timeout: 5 minutes of inactivity
const IDLE_TIMEOUT_MS = 5 * 60 * 1000

export function useLayercodeVoice(options: UseSimpleLayercodeVoiceOptions = {}) {
  const conversationIdRef = useRef<string | null>(null)
  const [conversationStarted, setConversationStarted] = useState(false)
  const lastActivityRef = useRef<number>(Date.now())
  const idleCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const agentRef = useRef<any>(null)

  // Use Layercode agent hook with deferred mic permission
  // audioInput: false prevents immediate mic permission request
  // NOTE: enableAmplitudeMonitoring must be true (default) for audio levels to work
  const agent = useLayercodeAgent({
    agentId: process.env.NEXT_PUBLIC_LAYERCODE_PIPELINE_ID!,
    authorizeSessionEndpoint: '/api/layercode/authorize',
    conversationId: conversationIdRef.current || undefined,
    metadata: options.metadata,
    audioInput: false,
    onConnect: ({ conversationId }) => {
      console.log('Connected to Layercode agent:', conversationId)
      if (conversationId) {
        conversationIdRef.current = conversationId
        setConversationStarted(true)
        lastActivityRef.current = Date.now() // Reset activity timer on connect
      }
    },
    onDisconnect: () => {
      console.log('Disconnected from Layercode agent')
      setConversationStarted(false)
    },
    onError: (error) => {
      console.error('Layercode error:', error)
    },
    onDataMessage: (data) => {
      // Update activity timestamp when agent sends data
      lastActivityRef.current = Date.now()

      // Pass through to parent component if handler provided
      if (options.onDataMessage) {
        options.onDataMessage(data)
      }
    }
  })

  const { status, userAudioAmplitude, agentAudioAmplitude, connect, disconnect, setAudioInput } = agent
  agentRef.current = agent

  // Start voice session - call from user gesture (button click)
  // This enables mic and connects, satisfying browser requirements
  const startVoiceSession = () => {
    console.log('Starting voice session...')
    setAudioInput(true)  // Enable mic (triggers permission prompt)
    connect()            // Connect to Layercode
  }

  // End session cleanly
  const endSession = () => {
    console.log('Ending voice session...')
    disconnect()
  }

  // Track user audio activity (speaking)
  useEffect(() => {
    if (userAudioAmplitude > 0) {
      lastActivityRef.current = Date.now()
    }
  }, [userAudioAmplitude])

  // Track agent audio activity (responding)
  useEffect(() => {
    if (agentAudioAmplitude > 0) {
      lastActivityRef.current = Date.now()
    }
  }, [agentAudioAmplitude])

  // Set up idle timeout checker
  useEffect(() => {
    if (status === 'connected') {
      // Check for idle timeout every 30 seconds
      idleCheckIntervalRef.current = setInterval(() => {
        const idleTime = Date.now() - lastActivityRef.current

        if (idleTime >= IDLE_TIMEOUT_MS) {
          console.warn('Session idle timeout reached (5 minutes)')

          // Disconnect the agent
          if (agentRef.current?.disconnect) {
            agentRef.current.disconnect()
          }

          // Notify parent component
          if (options.onIdleTimeout) {
            options.onIdleTimeout()
          }

          // Clean up interval
          if (idleCheckIntervalRef.current) {
            clearInterval(idleCheckIntervalRef.current)
            idleCheckIntervalRef.current = null
          }
        }
      }, 30000) // Check every 30 seconds
    } else {
      // Clean up interval when disconnected
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current)
        idleCheckIntervalRef.current = null
      }
    }

    // Cleanup interval when effect re-runs (but don't disconnect agent here)
    return () => {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current)
        idleCheckIntervalRef.current = null
      }
    }
  }, [status, options.onIdleTimeout])

  // Disconnect agent ONLY on component unmount (not on status changes)
  useEffect(() => {
    return () => {
      if (agentRef.current?.disconnect) {
        agentRef.current.disconnect()
      }
    }
  }, [])

  return {
    // Connection state
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    connectionStatus: status,

    // Audio levels for visual feedback
    userAudioLevel: userAudioAmplitude,
    agentAudioLevel: agentAudioAmplitude,

    // Conversation state
    conversationStarted,
    conversationId: conversationIdRef.current,

    // Actions - NEW: explicit session control for SDK 2.8.2
    startVoiceSession,  // Call from user gesture to start mic + connection
    endSession,         // Clean disconnect

    // Legacy action
    startNewConversation: () => {
      conversationIdRef.current = null
      setConversationStarted(false)
      // Will create new conversation on next connection
    }
  }
}