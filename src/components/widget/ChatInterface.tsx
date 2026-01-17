'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, Copy, Check, Sparkles, MessageCircle, ChevronDown, ChevronUp, Mail, Star, Send, Languages, Lightbulb, FileText, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useChat, ChatMessage } from '@/hooks/useChat'
import { usePostHog } from 'posthog-js/react'

// Quick action: Translate language options
const TRANSLATE_LANGUAGES = [
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'pt', label: 'Portuguese' },
]

interface ChatInterfaceProps {
  onClose: () => void
  pageUrl?: string
  showBranding?: boolean
  timezone?: string
  isDemo?: boolean
  apiKey?: string
  isExperimental?: boolean
}

export default function ChatInterface({
  onClose,
  pageUrl,
  showBranding = true,
  timezone,
  isDemo = false,
  apiKey,
  isExperimental = false
}: ChatInterfaceProps) {
  const posthog = usePostHog()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use provided pageUrl or capture from window
  const effectivePageUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '')

  // Chat hook
  const {
    messages,
    sessionId,
    isLoading,
    error,
    organizationName,
    isRestoredSession,
    sendMessage,
    startSession,
    startFreshConversation,
    endSession,
    clearError
  } = useChat({
    pageUrl: effectivePageUrl,
    apiKey,
    timezone,
    onError: (err) => console.error('Chat error:', err),
    onResponse: () => {
      // Trigger sparkle burst on response
      setShowSparkleBurst(true)
      setTimeout(() => setShowSparkleBurst(false), 800)
    }
  })

  // Local state
  const [inputValue, setInputValue] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [showSparkleBurst, setShowSparkleBurst] = useState(false)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
  const [isConversationCopied, setIsConversationCopied] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

  // Email escalation state
  const [isEscalationExpanded, setIsEscalationExpanded] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
  const [escalationSuccess, setEscalationSuccess] = useState(false)
  const [escalationError, setEscalationError] = useState('')

  // Rating state
  const [userRating, setUserRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [showRatingCheck, setShowRatingCheck] = useState(false)

  // Track close data for analytics
  const closeDataRef = useRef({ sessionId: '', messageCount: 0, pageUrl: effectivePageUrl })

  // Start session on mount
  useEffect(() => {
    startSession()
  }, [startSession])

  // Auto-focus input after session starts
  useEffect(() => {
    if (sessionId && !isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [sessionId, isLoading])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Update close data ref
  useEffect(() => {
    closeDataRef.current = {
      sessionId: sessionId || '',
      messageCount: messages.filter(m => !m.isGreeting).length,
      pageUrl: effectivePageUrl
    }
  }, [sessionId, messages, effectivePageUrl])

  // Track widget_closed on unmount
  useEffect(() => {
    return () => {
      const { sessionId, messageCount, pageUrl } = closeDataRef.current
      posthog?.capture('widget_closed', {
        page_url: pageUrl,
        conversation_id: sessionId,
        message_count: messageCount
      })
    }
  }, [posthog])

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage(inputValue.trim())
    setInputValue('')
  }

  // Auto-resize textarea (max ~4 lines = 120px)
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  // Resize textarea when content changes
  useEffect(() => {
    if (!inputRef.current) return
    const textarea = inputRef.current
    // Reset to auto to measure true scrollHeight
    textarea.style.height = 'auto'
    // Set height: empty = collapse, otherwise cap at 120px
    if (!inputValue) {
      textarea.style.height = 'auto'
    } else {
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [inputValue])

  // Handle Enter key (submit) vs Shift+Enter (newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && !isLoading) {
        handleSubmit(e as any)
      }
    }
  }

  // Handle copy response
  const handleCopyResponse = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      posthog?.capture('response_copied', {
        page_url: effectivePageUrl,
        conversation_id: sessionId,
        response_length: text.length
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Handle copy entire conversation
  const handleCopyConversation = async () => {
    if (messages.length === 0) return

    try {
      const conversationText = messages
        .filter(m => !m.isGreeting)
        .map((msg) => {
          const time = new Date(msg.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
          const role = msg.role === 'user' ? 'You' : 'Assistant'
          return `[${time}] ${role}: ${msg.content}`
        })
        .join('\n\n')

      const header = `Conversation Transcript - ${new Date().toLocaleString()}\n${'='.repeat(60)}\n\n`
      await navigator.clipboard.writeText(header + conversationText)
      setIsConversationCopied(true)
      setTimeout(() => setIsConversationCopied(false), 2000)
      posthog?.capture('conversation_copied', {
        page_url: effectivePageUrl,
        conversation_id: sessionId,
        message_count: messages.length
      })
    } catch (err) {
      console.error('Failed to copy conversation:', err)
    }
  }

  // Handle rating (optimistic UI - show thanks immediately)
  const handleRating = (rating: number) => {
    if (!sessionId || userRating) return

    // Update UI immediately
    setShowRatingCheck(true)
    setTimeout(() => setShowRatingCheck(false), 1000)
    setUserRating(rating)

    // Fire API in background (don't await)
    fetch('/api/conversations/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, rating })
    }).catch(error => console.error('Failed to submit rating:', error))

    posthog?.capture('feedback_submitted', {
      rating,
      session_id: sessionId,
      page_url: effectivePageUrl,
      message_count: messages.length
    })
  }

  // Handle email escalation
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionId) {
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
          session_id: sessionId,
          email: email.trim(),
          page_url: effectivePageUrl || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit email')
      }

      setEscalationSuccess(true)
      setEmail('')
      posthog?.capture('escalation_submitted', {
        session_id: sessionId,
        page_url: effectivePageUrl,
        message_count: messages.length
      })

      setTimeout(() => setIsEscalationExpanded(false), 3000)
    } catch (error) {
      setEscalationError(error instanceof Error ? error.message : 'Failed to submit email')
    } finally {
      setIsSubmittingEmail(false)
    }
  }

  // Handle quick action buttons (Translate, Explain, Summarize, Define)
  const handleQuickAction = (action: string, language?: string) => {
    if (!inputValue.trim()) return

    const prefixes: Record<string, string> = {
      translate: `Translate this to ${language}:`,
      explain: 'Explain this simply:',
      summarize: 'Summarize this:',
      define: 'Define the key terms in this:'
    }

    const fullMessage = `${prefixes[action]} ${inputValue.trim()}`
    sendMessage(fullMessage)
    setInputValue('')
    setShowLanguageDropdown(false)
  }

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setShowLanguageDropdown(false)
    if (showLanguageDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showLanguageDropdown])

  // Get last assistant response for display
  const lastResponse = messages.filter(m => m.role === 'assistant' && !m.isGreeting).slice(-1)[0]
  const greetingMessage = messages.find(m => m.isGreeting)
  const hasConversation = messages.filter(m => !m.isGreeting).length > 0

  return (
    <div className={`relative h-full flex flex-col ${!hasConversation && !isLoading ? 'justify-center' : ''}`}>
      {/* Fixed top section: Input + Quick Actions */}
      <div className={`flex-shrink-0 p-6 pb-4 space-y-4 ${hasConversation || isLoading ? 'border-b border-gray-700/50' : ''}`}>
        {/* Greeting - shown before any conversation */}
        {greetingMessage && !hasConversation && (
          <p className="text-center text-gray-400 text-sm">{greetingMessage.content}</p>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isLoading || !sessionId}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 resize-none overflow-y-auto"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || !sessionId}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Start fresh link - only show for restored sessions */}
        {isRestoredSession && (
          <div className="text-center">
            <button
              type="button"
              onClick={startFreshConversation}
              className="text-xs text-gray-500 hover:text-gray-400 underline"
            >
              Start new conversation
            </button>
          </div>
        )}
      </form>

      {/* Quick Action Buttons - Always visible */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Translate with dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (inputValue.trim()) setShowLanguageDropdown(!showLanguageDropdown)
            }}
            disabled={!inputValue.trim() || isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-200 hover:text-white'
                : 'bg-gray-800/20 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Translate</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Language dropdown */}
          <AnimatePresence>
            {showLanguageDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {TRANSLATE_LANGUAGES.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => handleQuickAction('translate', label)}
                    className="w-full px-4 py-2 text-xs text-left text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Other action buttons */}
        {[
          { key: 'explain', label: 'Explain Simply', icon: Lightbulb },
          { key: 'summarize', label: 'Summarize', icon: FileText },
          { key: 'define', label: 'Define Terms', icon: BookOpen }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleQuickAction(key)}
            disabled={!inputValue.trim() || isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-200 hover:text-white'
                : 'bg-gray-800/20 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
        </div>
      </div>

      {/* Scrollable content section - only show when there's content */}
      {(isLoading || hasConversation || showBranding) && (
      <div className={`overflow-y-auto p-6 pt-4 space-y-4 ${hasConversation ? 'flex-1' : ''}`}>
        {/* Loading State - Typing Dots */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-4"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">Thinking...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Display */}
      <div className={`w-full ${isExperimental ? 'max-w-2xl mx-auto' : ''}`}>
        <AnimatePresence>
          {lastResponse && !isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="relative overflow-hidden"
            >
              {/* Sparkle Burst */}
              <AnimatePresence>
                {showSparkleBurst && (
                  <div className="absolute top-4 left-4 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0.8],
                          x: Math.cos((i / 8) * Math.PI * 2) * 40,
                          y: Math.sin((i / 8) * Math.PI * 2) * 40,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              <div className="relative rounded-lg shadow-lg overflow-hidden">
                <div
                  className="relative bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-slate-900/40 backdrop-blur-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className={`flex-1 min-w-0 text-white leading-relaxed ${isExperimental ? 'text-base' : 'text-sm'}`}>
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-blue-300">{children}</strong>,
                          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-white">{children}</li>,
                          code: ({ children }) => <code className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-300 text-xs">{children}</code>,
                        }}
                      >
                        {lastResponse.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <div className="mt-3 flex items-center justify-end">
                    <button
                      onClick={() => handleCopyResponse(lastResponse.content)}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conversation History - Experimental mode only */}
      {isExperimental && hasConversation && (
        <div className="w-full max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <button
              onClick={() => {
                const newExpanded = !isHistoryExpanded
                setIsHistoryExpanded(newExpanded)
                if (newExpanded) {
                  posthog?.capture('conversation_history_viewed', {
                    page_url: effectivePageUrl,
                    conversation_id: sessionId,
                    message_count: messages.length
                  })
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-colors text-sm text-gray-400 hover:text-white"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {isHistoryExpanded ? 'Hide' : 'View'} conversation ({messages.filter(m => !m.isGreeting).length} messages)
              </span>
              {isHistoryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {isHistoryExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-slate-900/40 backdrop-blur-xl rounded-lg border border-gray-700/50 p-4 space-y-3">
                    <div className="space-y-3">
                      {messages.filter(m => !m.isGreeting).map((message, idx) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-3"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {message.role === 'user' ? (
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <span className="text-xs">You</span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${message.role === 'user' ? 'text-blue-400' : 'text-purple-400'}`}>
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
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              ) : (
                                message.content
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

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

      {/* Email Escalation - Non-experimental only */}
      {!isExperimental && hasConversation && (
        <div className="w-full max-w-md mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <button
              onClick={() => {
                const newExpanded = !isEscalationExpanded
                setIsEscalationExpanded(newExpanded)
                if (newExpanded) {
                  posthog?.capture('escalation_form_opened', {
                    page_url: effectivePageUrl,
                    conversation_id: sessionId,
                    message_count: messages.length
                  })
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-800/50 to-purple-800/50 hover:from-blue-700/50 hover:to-purple-700/50 border border-blue-700/50 rounded-lg transition-colors text-sm text-gray-200 hover:text-white"
            >
              <Mail className="w-4 h-4" />
              <span>{escalationSuccess ? "We'll follow up soon!" : 'Need more help? Get a human response'}</span>
              {isEscalationExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {isEscalationExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-slate-900/40 backdrop-blur-xl rounded-lg border border-blue-700/50 p-4 space-y-3">
                    {escalationSuccess ? (
                      <div className="text-center py-2">
                        <div className="text-green-400 text-sm font-medium mb-1">Email submitted!</div>
                        <div className="text-gray-400 text-xs">We'll review and follow up soon.</div>
                      </div>
                    ) : (
                      <form onSubmit={handleEmailSubmit} className="space-y-3">
                        <div>
                          <label htmlFor="escalation-email" className="block text-xs text-gray-400 mb-2">
                            We'll analyze the responses and get back to you:
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
                        {escalationError && <div className="text-red-400 text-xs">{escalationError}</div>}
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

      {/* Rating - After first response */}
      {hasConversation && (
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col items-center gap-2">
            <AnimatePresence mode="wait">
              {showRatingCheck ? (
                <motion.div
                  key="checkmark"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1 text-green-400 text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Thanks!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="stars"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-xs italic text-gray-400">Was this helpful?</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => !userRating && setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        disabled={userRating !== null}
                        className={`p-0.5 transition-all ${
                          userRating === null ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'
                        }`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            (hoverRating !== null ? star <= hoverRating : star <= (userRating || 0))
                              ? 'text-orange-400 fill-orange-400'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

        {/* Powered by EasyAsk Footer */}
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
      )}
    </div>
  )
}
