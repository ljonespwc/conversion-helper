'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Mic, Volume2, Loader2, ExternalLink, Copy, Check, Sparkles, MessageCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useLayercodeVoice } from '@/hooks/useSimpleLayercodeVoice'
import { usePostHog } from 'posthog-js/react'

// URL extraction types (inline)
type ExtractedLink = {
  type: 'url' | 'text'
  text: string
  href?: string
  description?: string
}

type URLExtractionResult = {
  hasLinks: boolean
  links: ExtractedLink[]
}

type ConversationMessage = {
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}

interface SimplifiedVoiceInterfaceProps {
  onClose: () => void
  pageUrl?: string
  showBranding?: boolean
}

export default function SimplifiedVoiceInterface({ onClose, pageUrl, showBranding = true }: SimplifiedVoiceInterfaceProps) {
  const posthog = usePostHog()
  const [hasStarted, setHasStarted] = useState(false)
  const [hasHadFirstInteraction, setHasHadFirstInteraction] = useState(false)
  const [currentURLs, setCurrentURLs] = useState<URLExtractionResult | null>(null)
  const [showURLs, setShowURLs] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<string | null>(null)
  const [responseType, setResponseType] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)
  const [aiIsSpeaking, setAiIsSpeaking] = useState(false)
  const [showSparkleBurst, setShowSparkleBurst] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
  const [isConversationCopied, setIsConversationCopied] = useState(false)

  // Email escalation state
  const [isEscalationExpanded, setIsEscalationExpanded] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
  const [escalationSuccess, setEscalationSuccess] = useState(false)
  const [escalationError, setEscalationError] = useState('')

  // Feedback state for conversation
  const [conversationFeedback, setConversationFeedback] = useState<'positive' | 'negative' | null>(null)
  const [showFeedbackCheck, setShowFeedbackCheck] = useState(false)

  // Use provided pageUrl or capture from window if not provided
  const effectivePageUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '')

  // Memoize metadata to prevent unnecessary reconnections on every render
  // NOTE: timestamp is generated fresh each time to avoid mobile audio issues
  const metadata = useMemo(() => ({
    source: 'easyask-assistant',
    ...(effectivePageUrl && { page_url: effectivePageUrl })
  }), [effectivePageUrl])

  // Memoize onDataMessage callback to prevent reconnections
  const handleDataMessage = useCallback((data: any) => {
    // Extract content from either wrapped or direct structure
    const content = data?.content || data

    // Capture AI response text
    if (content?.response) {
      // Clear previous response and URLs when new response arrives
      setCurrentResponse(null)
      setShowURLs(false)

      // Trigger sparkle burst animation
      setShowSparkleBurst(true)
      setTimeout(() => setShowSparkleBurst(false), 800)

      // Add messages to conversation history
      const timestamp = Date.now()
      const newMessages: ConversationMessage[] = []

      // Add user question if available
      if (content?.question) {
        newMessages.push({
          role: 'user',
          text: content.question,
          timestamp
        })
      }

      // Add AI response
      const responseTimestamp = timestamp + 1 // Ensure AI response comes after
      newMessages.push({
        role: 'assistant',
        text: content.response,
        timestamp: responseTimestamp
      })

      setConversationHistory(prev => [...prev, ...newMessages])

      // Small delay to allow exit animation before showing new response
      setTimeout(() => {
        setCurrentResponse(content.response)
        setResponseType(content.type || null)
        setAiIsSpeaking(true) // AI started speaking
      }, 100)
    }

    // Capture URLs (existing logic)
    if (content?.urls?.hasLinks) {
      setCurrentURLs(content.urls)
      setShowURLs(true)
    }
  }, []) // Empty deps: state setters are stable

  const {
    isConnected,
    isConnecting,
    connectionStatus,
    userAudioLevel,
    agentAudioLevel,
    conversationId,
    startNewConversation,
    startVoiceSession
  } = useLayercodeVoice({
    metadata,
    onDataMessage: handleDataMessage
  })

  // Track if user has initiated the voice session (clicked start button)
  const [voiceSessionStarted, setVoiceSessionStarted] = useState(false)

  // Handle start voice button click - user gesture triggers mic permission
  const handleStartVoice = () => {
    console.log('User clicked start voice button')
    setVoiceSessionStarted(true)
    startVoiceSession()  // This calls connect() + setAudioInput(true)
  }

  // Auto-start conversation when connected
  useEffect(() => {
    if (isConnected && !hasStarted) {
      setHasStarted(true)
      // Track conversation start
      posthog?.capture('conversation_started', {
        page_url: effectivePageUrl,
        conversation_id: conversationId
      })
      // Conversation starts automatically - user can just speak
    }
  }, [isConnected, hasStarted, posthog, effectivePageUrl, conversationId])

  // Handle end conversation
  const handleEndConversation = () => {
    // Track conversation end
    posthog?.capture('widget_closed', {
      page_url: effectivePageUrl,
      conversation_id: conversationId,
      message_count: conversationHistory.length
    })
    startNewConversation()
    onClose()
  }

  // Handle copy response
  const handleCopyResponse = async () => {
    if (!currentResponse) return
    try {
      await navigator.clipboard.writeText(currentResponse)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      // Track copy event
      posthog?.capture('response_copied', {
        page_url: effectivePageUrl,
        conversation_id: conversationId,
        response_length: currentResponse.length
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Handle copy entire conversation
  const handleCopyConversation = async () => {
    if (conversationHistory.length === 0) return

    try {
      // Format conversation as readable text
      const conversationText = conversationHistory
        .map((msg) => {
          const time = new Date(msg.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })
          const role = msg.role === 'user' ? 'You' : 'Assistant'
          return `[${time}] ${role}: ${msg.text}`
        })
        .join('\n\n')

      // Add header with timestamp
      const header = `Conversation Transcript - ${new Date().toLocaleString()}\n${'='.repeat(60)}\n\n`
      const fullText = header + conversationText

      await navigator.clipboard.writeText(fullText)
      setIsConversationCopied(true)
      setTimeout(() => setIsConversationCopied(false), 2000)
      // Track conversation copy
      posthog?.capture('conversation_copied', {
        page_url: effectivePageUrl,
        conversation_id: conversationId,
        message_count: conversationHistory.length
      })
    } catch (err) {
      console.error('Failed to copy conversation:', err)
    }
  }

  // Handle feedback submission (session-level)
  const handleFeedback = async (feedback: 'positive' | 'negative') => {
    if (!conversationId) {
      console.warn('❌ No conversationId - cannot submit feedback')
      return
    }

    if (conversationFeedback) {
      console.warn('❌ Already gave feedback - cannot submit again')
      return
    }

    try {
      const response = await fetch('/api/conversations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: conversationId,
          feedback
        })
      })

      if (response.ok) {
        // Show checkmark animation
        setShowFeedbackCheck(true)
        setTimeout(() => setShowFeedbackCheck(false), 1000)

        // Set feedback state (disables buttons)
        setConversationFeedback(feedback)
        console.log(`✅ Conversation feedback submitted: ${feedback}`)

        // Track feedback submission
        posthog?.capture('feedback_submitted', {
          feedback_type: feedback,
          session_id: conversationId,
          page_url: effectivePageUrl,
          message_count: conversationHistory.length
        })
      } else {
        const errorData = await response.json()
        console.error('❌ API error:', errorData)
      }
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error)
    }
  }

  // Handle email escalation submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!conversationId) {
      setEscalationError('Conversation not started yet')
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEscalationError('Please enter a valid email address')
      return
    }

    setIsSubmittingEmail(true)
    setEscalationError('')

    try {
      const response = await fetch('/api/conversations/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: conversationId,
          email: email.trim(),
          page_url: effectivePageUrl || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit email')
      }

      setEscalationSuccess(true)
      setEmail('') // Clear email input
      console.log('✅ Email escalation submitted successfully')

      // Track escalation submission
      posthog?.capture('escalation_submitted', {
        session_id: conversationId,
        page_url: effectivePageUrl,
        message_count: conversationHistory.length
      })

      // Auto-collapse after 3 seconds
      setTimeout(() => {
        setIsEscalationExpanded(false)
      }, 3000)
    } catch (error) {
      console.error('Email submission error:', error)
      setEscalationError(error instanceof Error ? error.message : 'Failed to submit email. Please try again.')
    } finally {
      setIsSubmittingEmail(false)
    }
  }

  // Check if content is scrollable and track scroll position
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 5
    setIsScrolledToBottom(isAtBottom)
  }

  // Check if content is scrollable when response changes
  useEffect(() => {
    const checkScrollable = () => {
      const element = document.getElementById('response-content')
      if (element) {
        setIsScrollable(element.scrollHeight > element.clientHeight)
        setIsScrolledToBottom(element.scrollHeight <= element.clientHeight)
      }
    }

    if (currentResponse) {
      // Small delay to ensure content is rendered
      setTimeout(checkScrollable, 100)
    }
  }, [currentResponse])

  // Determine current state
  // Use amplitude only for user detection, use state flag for AI (no flickering)
  const isSpeaking = userAudioLevel > 0.01
  const isListening = aiIsSpeaking // AI speaking state set when response arrives
  const isActive = hasStarted && isConnected

  // Track first interaction
  useEffect(() => {
    if ((isSpeaking || isListening) && !hasHadFirstInteraction) {
      setHasHadFirstInteraction(true)
    }
  }, [isSpeaking, isListening, hasHadFirstInteraction])

  // Detect AI speaking via amplitude (for welcome msg and TTS)
  useEffect(() => {
    // Only update state when it actually needs to change
    // Prevents constant re-renders while AI speaks
    if (agentAudioLevel > 0.05 && !aiIsSpeaking) {
      setAiIsSpeaking(true)
    }
  }, [agentAudioLevel, aiIsSpeaking])

  // Detect when user starts speaking (for state management only)
  useEffect(() => {
    // Only update state when it actually needs to change
    // Prevents constant re-renders while user speaks
    if (userAudioLevel > 0.01 && aiIsSpeaking) {
      setAiIsSpeaking(false)
    }
  }, [userAudioLevel, aiIsSpeaking])

  // Removed debug logging

  // Get button color based on state
  const getButtonColor = () => {
    if (!isConnected) return 'bg-gray-400'
    if (isSpeaking) return 'bg-green-500'
    if (isListening) return 'bg-easyask-secondary'
    return 'bg-easyask-secondary hover:bg-easyask-accent'
  }

  // Get status text - only three states, no bouncing
  const getStatusText = () => {
    if (!isConnected) return 'Connecting...'
    if (!hasStarted) return 'Click to start conversation'

    // During conversation - only show these two states
    if (isSpeaking) return 'Listening to you...'
    if (isListening) return 'Speaking...'

    // Initial state only (before first interaction)
    if (!hasHadFirstInteraction) return 'Ask me anything'

    // After interaction has happened, show nothing during silence
    return ' '  // Space to maintain layout
  }

  // Pass connection status to parent
  useEffect(() => {
    if (window && (window as any).updateConnectionStatus) {
      (window as any).updateConnectionStatus(isConnected)
    }
  }, [isConnected])

  return (
    <div className="relative p-6 space-y-4">

      {/* Pre-connection Start Screen */}
      {!voiceSessionStarted && (
        <div className="flex flex-col items-center space-y-6 py-8">
          <motion.button
            onClick={handleStartVoice}
            className="relative p-6 rounded-full bg-easyask-secondary hover:bg-easyask-accent transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic className="w-12 h-12 text-white" />
          </motion.button>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Tap to start voice assistant
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Microphone access required
            </p>
          </div>
        </div>
      )}

      {/* Connecting State - After user clicked start */}
      {voiceSessionStarted && isConnecting && (
        <div className="flex flex-col items-center space-y-4 py-8">
          <div className="p-4 rounded-full bg-gray-400">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connecting...
          </p>
        </div>
      )}

      {/* Main Interface - Only show after connected */}
      {voiceSessionStarted && isConnected && (
      <div className="flex flex-col items-center space-y-4">
        {/* Voice Button with Sparkle Burst */}
        <div className="relative">
          <motion.button
            onClick={() => {
              if (!hasStarted && isConnected) {
                setHasStarted(true)
              }
            }}
            disabled={!isConnected || (hasStarted && isActive)}
            className={`relative p-4 rounded-full transition-all ${getButtonColor()} ${
              !isConnected ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              isSpeaking || isListening ? 'animate-pulse' : ''
            }`}
            whileTap={!hasStarted ? { scale: 0.95 } : {}}
          >
            {/* Icon */}
            {isConnecting ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : isListening ? (
              <Volume2 className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </motion.button>

          {/* Sparkle Burst Animation */}
          <AnimatePresence>
            {showSparkleBurst && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.8],
                      x: Math.cos((i / 8) * Math.PI * 2) * 60,
                      y: Math.sin((i / 8) * Math.PI * 2) * 60,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut"
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Status Text - Fixed height container */}
        <div className="h-12 flex flex-col items-center justify-center">
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400 text-center"
            key={getStatusText()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getStatusText()}
          </motion.p>
          {isListening && (
            <motion.p
              className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              (Feel free to interrupt)
            </motion.p>
          )}
        </div>

        {/* AI Response Text Display */}
        <div className="w-full max-w-md px-4">
          <AnimatePresence>
            {currentResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative"
              >
                <div className="relative rounded-lg shadow-lg overflow-hidden">
                  {/* Frosted glass with blue/purple tint */}
                  <div
                    id="response-content"
                    onScroll={handleScroll}
                    className="relative bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-slate-900/40 backdrop-blur-xl p-4 max-h-[200px] overflow-y-auto"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0 text-white text-sm leading-relaxed">
                        <ReactMarkdown
                          components={{
                            // Custom styling for markdown elements
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-blue-300">{children}</strong>,
                            em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-white">{children}</li>,
                            code: ({ children }) => <code className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-300 text-xs">{children}</code>,
                          }}
                        >
                          {currentResponse}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Copy Button */}
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        onClick={handleCopyResponse}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-md transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Scroll indicator - fade gradient at bottom when more content below */}
                  {isScrollable && !isScrolledToBottom && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Conversation History - COMMENTED OUT */}
        {false && conversationHistory.length > 0 && (
          <div className="w-full max-w-md px-4 mt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 relative z-10"
            >
              {/* Toggle Button */}
              <button
                onClick={() => {
                  const newExpanded = !isHistoryExpanded
                  setIsHistoryExpanded(newExpanded)
                  // Track conversation history view
                  if (newExpanded) {
                    posthog?.capture('conversation_history_viewed', {
                      page_url: effectivePageUrl,
                      conversation_id: conversationId,
                      message_count: conversationHistory.length
                    })
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-colors text-sm text-gray-400 hover:text-white relative z-10"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {isHistoryExpanded ? 'Hide' : 'View'} conversation ({conversationHistory.length} message{conversationHistory.length !== 1 ? 's' : ''})
                </span>
                {isHistoryExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* History Content */}
              <AnimatePresence>
                {isHistoryExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-slate-900/40 backdrop-blur-xl rounded-lg border border-gray-700/50 p-4 space-y-3">
                      {/* Scrollable messages area */}
                      <div className="max-h-[250px] overflow-y-auto space-y-3 pr-2">
                        {conversationHistory.map((message, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex gap-3 ${
                              message.role === 'user' ? 'flex-row' : 'flex-row'
                            }`}
                          >
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                              {message.role === 'user' ? (
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <span className="text-xs">👤</span>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                </div>
                              )}
                            </div>

                            {/* Message */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-medium ${
                                  message.role === 'user' ? 'text-blue-400' : 'text-purple-400'
                                }`}>
                                  {message.role === 'user' ? 'You' : 'Assistant'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </span>
                              </div>
                              <div className="text-sm text-gray-200 leading-relaxed">
                                {message.role === 'assistant' ? (
                                  <ReactMarkdown
                                    components={{
                                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                      strong: ({ children }) => <strong className="font-semibold text-purple-300">{children}</strong>,
                                      em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                                      ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>,
                                      ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>,
                                      li: ({ children }) => <li className="text-gray-200 text-xs">{children}</li>,
                                      code: ({ children }) => <code className="bg-gray-800 px-1 py-0.5 rounded text-purple-300 text-xs">{children}</code>,
                                    }}
                                  >
                                    {message.text}
                                  </ReactMarkdown>
                                ) : (
                                  message.text
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Copy Conversation Button */}
                      <div className="pt-2 border-t border-gray-700/50 flex justify-end">
                        <button
                          onClick={handleCopyConversation}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-md transition-colors"
                        >
                          {isConversationCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy conversation</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Email Escalation - Appears after first AI response */}
        {conversationHistory.length > 0 && (
          <div className="w-full max-w-md px-4 mt-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 relative z-10"
            >
              {/* Toggle Button */}
              <button
                onClick={() => {
                  const newExpanded = !isEscalationExpanded
                  setIsEscalationExpanded(newExpanded)
                  // Track escalation form opened
                  if (newExpanded) {
                    posthog?.capture('escalation_form_opened', {
                      page_url: effectivePageUrl,
                      conversation_id: conversationId,
                      message_count: conversationHistory.length
                    })
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-800/50 to-purple-800/50 hover:from-blue-700/50 hover:to-purple-700/50 border border-blue-700/50 rounded-lg transition-colors text-sm text-gray-200 hover:text-white relative z-10"
              >
                <Mail className="w-4 h-4" />
                <span>
                  {escalationSuccess ? '✓ We\'ll follow up soon!' : 'Need more help? Get a human response'}
                </span>
                {isEscalationExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Escalation Form */}
              <AnimatePresence>
                {isEscalationExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-slate-900/40 backdrop-blur-xl rounded-lg border border-blue-700/50 p-4 space-y-3">
                      {escalationSuccess ? (
                        <div className="text-center py-2">
                          <div className="text-green-400 text-sm font-medium mb-1">
                            ✓ Email submitted successfully!
                          </div>
                          <div className="text-gray-400 text-xs">
                            We'll review the conversation and follow up soon.
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleEmailSubmit} className="space-y-3">
                          <div>
                            <label htmlFor="escalation-email" className="block text-xs text-gray-400 mb-2">
                              We'll analyze the Assistant's responses and get back to you soon:
                            </label>
                            <input
                              id="escalation-email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your@email.com"
                              disabled={isSubmittingEmail}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                            />
                          </div>

                          {escalationError && (
                            <div className="text-red-400 text-xs">
                              {escalationError}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isSubmittingEmail || !email.trim()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                          >
                            {isSubmittingEmail ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <Mail className="w-4 h-4" />
                                <span>Submit email</span>
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Conversation Feedback - Appears after first AI response */}
        {conversationHistory.length > 0 && (
          <div className="w-full max-w-md px-4 mt-3">
            <div className="flex items-center justify-center gap-2">
              <AnimatePresence mode="wait">
                {showFeedbackCheck ? (
                  <motion.div
                    key="checkmark"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1 text-green-400 text-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Thanks!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="buttons"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs italic text-gray-400">Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback('positive')}
                      disabled={conversationFeedback !== null}
                      className={`
                        w-8 h-8 rounded-full border-2
                        flex items-center justify-center
                        text-base transition-all
                        ${conversationFeedback === null
                          ? 'border-gray-600 hover:border-green-400 hover:bg-green-400/10 hover:scale-110 cursor-pointer'
                          : 'border-gray-700 opacity-30 cursor-not-allowed'
                        }
                      `}
                      title="Helpful conversation"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleFeedback('negative')}
                      disabled={conversationFeedback !== null}
                      className={`
                        w-8 h-8 rounded-full border-2
                        flex items-center justify-center
                        text-base transition-all
                        ${conversationFeedback === null
                          ? 'border-gray-600 hover:border-red-400 hover:bg-red-400/10 hover:scale-110 cursor-pointer'
                          : 'border-gray-700 opacity-30 cursor-not-allowed'
                        }
                      `}
                      title="Not helpful"
                    >
                      👎
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* URL Display Area - Card Style */}
        <div className="w-full max-w-md px-4">
          <AnimatePresence>
            {showURLs && currentURLs?.hasLinks && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {currentURLs.links.map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    {link.type === 'url' ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full border-2 border-gray-300 bg-white rounded-md px-4 py-3 hover:border-easyask-secondary hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <ExternalLink className="w-5 h-5 text-easyask-secondary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-medium text-gray-900 truncate">
                              {link.text}
                            </div>
                            {link.description && (
                              <div className="text-sm text-gray-500 mt-0.5">
                                {link.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </a>
                    ) : (
                      <div className="block w-full border-2 border-gray-200 bg-gray-50 rounded-md px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="text-base text-gray-400 italic">
                            {link.text}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}

      {/* Powered by EasyAsk Footer - Conditional based on organization setting */}
      {showBranding && (
        <div className="flex items-center justify-center pt-4 pb-2">
          <a
            href="https://easyask.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
          >
            Powered by EasyAsk
          </a>
        </div>
      )}

    </div>
  )
}