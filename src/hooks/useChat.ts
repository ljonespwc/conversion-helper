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
  groupId?: string
  visitorId?: string
  onError?: (error: Error) => void
  onResponse?: (response: string) => void
}

interface UseChatReturn {
  messages: ChatMessage[]
  sessionId: string | null
  isLoading: boolean
  error: string | null
  organizationName: string | null
  isRestoredSession: boolean
  hasExistingRating: boolean
  sendMessage: (message: string, options?: { skipFileSearch?: boolean; quickAction?: string }) => Promise<void>
  startSession: () => void
  startFreshConversation: () => void
  endSession: () => void
  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

// localStorage helpers for session persistence (per-domain via apiKey)
const STORAGE_KEY_PREFIX = 'easyask_session_'
const getStorageKey = (apiKey: string) =>
  `${STORAGE_KEY_PREFIX}${apiKey?.substring(0, 20) || 'default'}`

export function useChat(options: UseChatOptions): UseChatReturn {
  const { pageUrl, apiKey, timezone, groupId, visitorId, onError, onResponse } = options

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState<string | null>(null)
  const [isRestoredSession, setIsRestoredSession] = useState(false)
  const [hasExistingRating, setHasExistingRating] = useState(false)

  // Track if session has started
  const sessionStarted = useRef(false)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const startSession = useCallback(async () => {
    if (sessionStarted.current) return

    // Check localStorage for existing session
    try {
      const storageKey = getStorageKey(apiKey || '')
      const stored = localStorage.getItem(storageKey)

      if (stored && apiKey) {
        const parsed = JSON.parse(stored)

        if (parsed.apiKey === apiKey) {
          // Try to restore session from server (cache-bust to get fresh data)
          const response = await fetch(
            `/api/conversations/messages?session_id=${parsed.sessionId}&api_key=${apiKey}&_t=${Date.now()}`,
            { cache: 'no-store' }
          )
          const data = await response.json()

          if (data.session_exists && data.messages?.length > 0) {
            setSessionId(parsed.sessionId)
            setMessages(data.messages.map((m: any) => ({
              id: generateId(),
              role: m.role,
              content: m.content,
              timestamp: m.timestamp || Date.now()
            })))
            sessionStarted.current = true
            setIsRestoredSession(true)
            setHasExistingRating(data.has_rating === true)
            setError(null)
            return
          }
        }
        // Invalid or empty session - clear localStorage
        localStorage.removeItem(storageKey)
      }
    } catch (e) {
      // Continue to create new session
    }

    // Start new session
    const newSessionId = generateId()
    setSessionId(newSessionId)
    sessionStarted.current = true
    setIsRestoredSession(false)
    setError(null)

    // Save to localStorage
    if (apiKey) {
      try {
        localStorage.setItem(getStorageKey(apiKey), JSON.stringify({
          sessionId: newSessionId,
          apiKey: apiKey,
          lastActivity: Date.now()
        }))
      } catch (e) {
        console.error('Failed to save session to localStorage:', e)
      }
    }

    // Generate greeting client-side (instant)
    const greetingMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: 'Hey there! What can I help you with?',
      timestamp: Date.now(),
      isGreeting: true
    }
    setMessages([greetingMessage])
  }, [apiKey])

  const startFreshConversation = useCallback(() => {
    // Clear localStorage
    if (apiKey) {
      try {
        localStorage.removeItem(getStorageKey(apiKey))
      } catch (e) {
        console.error('Failed to clear localStorage:', e)
      }
    }

    // Reset state
    setMessages([])
    setSessionId(null)
    sessionStarted.current = false
    setIsRestoredSession(false)
    setHasExistingRating(false)
    setError(null)

    // Start fresh session (will create new ID and show greeting)
    // Use setTimeout to ensure state is cleared first
    setTimeout(() => {
      startSession()
    }, 0)
  }, [apiKey, startSession])

  const sendMessage = useCallback(async (message: string, options?: { skipFileSearch?: boolean; quickAction?: string }) => {
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
          timezone,
          group_id: groupId,
          visitor_id: visitorId,
          ...(options?.skipFileSearch && { skip_file_search: true }),
          ...(options?.quickAction && { quick_action: options.quickAction })
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

      // Update localStorage lastActivity
      if (apiKey) {
        try {
          const storageKey = getStorageKey(apiKey)
          const stored = localStorage.getItem(storageKey)
          if (stored) {
            const parsed = JSON.parse(stored)
            parsed.lastActivity = Date.now()
            localStorage.setItem(storageKey, JSON.stringify(parsed))
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }

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
  }, [sessionId, pageUrl, apiKey, timezone, groupId, visitorId, onError, onResponse])

  const endSession = useCallback(() => {
    setMessages([])
    setSessionId(null)
    setError(null)
    setOrganizationName(null)
    setIsRestoredSession(false)
    setHasExistingRating(false)
    sessionStarted.current = false
  }, [])

  return {
    messages,
    sessionId,
    isLoading,
    error,
    organizationName,
    isRestoredSession,
    hasExistingRating,
    sendMessage,
    startSession,
    startFreshConversation,
    endSession,
    clearError
  }
}
