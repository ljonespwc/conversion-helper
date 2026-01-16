'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isGreeting?: boolean
}

interface UseChatOptions {
  pageUrl: string
  apiKey?: string
  timezone?: string
  onError?: (error: Error) => void
  onResponse?: (response: string) => void
}

interface UseChatReturn {
  messages: ChatMessage[]
  sessionId: string | null
  isLoading: boolean
  error: string | null
  organizationName: string | null
  sendMessage: (message: string) => Promise<void>
  startSession: () => void
  endSession: () => void
  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

function getTimeGreeting(timezone?: string): string {
  try {
    const hour = new Date().toLocaleString('en-US', {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: 'numeric',
      hour12: false
    })
    const h = parseInt(hour, 10)
    if (h >= 5 && h < 12) return 'Good morning'
    if (h >= 12 && h < 17) return 'Good afternoon'
    if (h >= 17 && h < 21) return 'Good evening'
    return 'Hey there'
  } catch {
    return 'Hey there'
  }
}

export function useChat(options: UseChatOptions): UseChatReturn {
  const { pageUrl, apiKey, timezone, onError, onResponse } = options

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState<string | null>(null)

  // Track if session has started
  const sessionStarted = useRef(false)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const startSession = useCallback(() => {
    if (sessionStarted.current) return

    // Generate session ID and greeting instantly - no API call needed
    const newSessionId = generateId()
    setSessionId(newSessionId)
    sessionStarted.current = true
    setError(null)

    // Generate greeting client-side (instant)
    const greeting = getTimeGreeting(timezone)
    const greetingMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: `${greeting}! What questions can I answer for you?`,
      timestamp: Date.now(),
      isGreeting: true
    }
    setMessages([greetingMessage])
  }, [timezone])

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return
    if (!sessionId) {
      setError('Session not started')
      return
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message.trim(),
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: message.trim(),
          page_url: pageUrl,
          api_key: apiKey,
          timezone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, assistantMessage])

      onResponse?.(data.response)

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send message'
      setError(errorMessage)
      onError?.(err)

      // Remove the user message if we failed
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, pageUrl, apiKey, timezone, onError, onResponse])

  const endSession = useCallback(() => {
    setMessages([])
    setSessionId(null)
    setError(null)
    setOrganizationName(null)
    sessionStarted.current = false
  }, [])

  return {
    messages,
    sessionId,
    isLoading,
    error,
    organizationName,
    sendMessage,
    startSession,
    endSession,
    clearError
  }
}
