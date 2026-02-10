'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Loader2, Check, Sparkles, ChevronDown, Send, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useChat, ChatMessage } from '@/hooks/useChat'
import { usePostHog } from 'posthog-js/react'
import { getQuickActionsForGoal, hasTranslateAction, hasInputRequiredAction, type PageGoal, type QuickAction } from '@/lib/quick-actions'

// ============================================================================
// Constants
// ============================================================================

const TRANSLATE_LANGUAGES = [
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'pt', label: 'Portuguese' },
] as const


// ============================================================================
// Types
// ============================================================================

interface ChatInterfaceProps {
  onClose: () => void
  pageUrl?: string
  showBranding?: boolean
  timezone?: string
  isDemo?: boolean
  apiKey?: string
  isExperimental?: boolean
  groupId?: string
  visitorId?: string
  pageGoal?: string | null
  onConversationStart?: () => void
  onSessionRestored?: () => void
}

export interface ChatInterfaceHandle {
  canDownload: boolean
  downloadTranscript: () => void
  isRestoredSession: boolean
  startFreshConversation: () => void
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  disabled: boolean
  onClick: () => void
}


// ============================================================================
// Markdown Rendering Configuration
// ============================================================================

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-lg font-bold text-gray-900 mt-3 mb-2 first:mt-0">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-base font-bold text-gray-900 mt-3 mb-2 first:mt-0">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-sm font-bold text-gray-800 mt-2 mb-1 first:mt-0">{children}</h3>,
  h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-sm font-semibold text-gray-800 mt-2 mb-1 first:mt-0">{children}</h4>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-orange-600">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-gray-600">{children}</em>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-outside pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-outside pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="text-gray-700 pl-1">{children}</li>,
  code: ({ children }: { children?: React.ReactNode }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-orange-600 text-xs">{children}</code>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-orange-600 underline hover:text-orange-700">{children}</a>,
}

// ============================================================================
// Helper Functions
// ============================================================================

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// ============================================================================
// Sub-Components
// ============================================================================

function QuickActionButton({ icon: Icon, label, disabled, onClick }: QuickActionButtonProps): JSX.Element {
  const baseClasses = 'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all duration-150'
  const enabledClasses = 'bg-white hover:bg-gradient-to-r hover:from-rose-500 hover:to-orange-500 border-gray-200 text-orange-600 hover:text-white hover:border-transparent shadow-sm hover:shadow'
  const disabledClasses = 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  )
}

function TypingIndicator(): JSX.Element {
  return (
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
            className="w-2 h-2 bg-orange-500 rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500">Thinking...</span>
    </motion.div>
  )
}

function SparkleBurst(): JSX.Element {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 1],
            x: Math.cos((i / 8) * Math.PI * 2) * 80,
            y: Math.sin((i / 8) * Math.PI * 2) * 80,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </motion.div>
      ))}
    </div>
  )
}

// Split content to extract trailing question (last paragraph ending with ?)
function splitTrailingQuestion(content: string): { main: string; question: string | null } {
  const paragraphs = content.trim().split(/\n\n+/)
  if (paragraphs.length === 0) return { main: content, question: null }

  const lastParagraph = paragraphs[paragraphs.length - 1].trim()

  // Check if last paragraph ends with a question mark
  if (lastParagraph.endsWith('?')) {
    const main = paragraphs.slice(0, -1).join('\n\n')
    return { main, question: lastParagraph }
  }

  return { main: content, question: null }
}

interface ChatBubbleProps {
  message: ChatMessage
  isNew?: boolean
  showRating?: boolean
  userRating: number | null
  hasFirstResponse: boolean
  showRatingCheck: boolean
  onRate: (rating: number) => void
  pageGoal?: string | null
}

function ChatBubble({ message, isNew = false, showRating = false, userRating, hasFirstResponse, showRatingCheck, onRate, pageGoal }: ChatBubbleProps): JSX.Element {
  const isUser = message.role === 'user'

  // For AI messages, check for trailing question
  const { main, question } = isUser
    ? { main: message.content, question: null }
    : splitTrailingQuestion(message.content)

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className={`w-full rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white'
          : 'bg-orange-50 border border-gray-200 text-gray-800'
      }`}>
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed">
            {main && (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {main}
              </ReactMarkdown>
            )}
            {question && (
              <p className="mt-3 font-semibold bg-orange-100 px-2 py-1 -mx-1 rounded">
                {pageGoal === 'sell' && main ? `❓ ${question}` : question}
              </p>
            )}
          </div>
        )}
      </div>
      {/* Rating thumbs - shown on last AI message */}
      {showRating && !isUser && (
        <div className="flex items-center justify-end mt-2 gap-2">
          <AnimatePresence mode="wait">
            {showRatingCheck ? (
              <motion.div
                key="checkmark"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-1 text-gray-500 text-xs"
              >
                <Check className="w-3 h-3" />
                <span>Thanks!</span>
              </motion.div>
            ) : (
              <motion.div
                key="thumbs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2.5"
              >
                <span className="text-xs text-gray-400">Helpful?</span>
                <button
                  onClick={() => onRate(5)}
                  disabled={userRating !== null}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-200 border ${
                    userRating === null
                      ? 'border-green-300 bg-green-50 hover:bg-green-100 hover:scale-110 cursor-pointer'
                      : userRating === 5 ? 'border-green-400 bg-green-100' : 'opacity-20 border-gray-200 bg-gray-50'
                  }`}
                  title="Helpful"
                >
                  👍
                </button>
                <button
                  onClick={() => onRate(1)}
                  disabled={userRating !== null}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-200 border ${
                    userRating === null
                      ? 'border-red-300 bg-red-50 hover:bg-red-100 hover:scale-110 cursor-pointer'
                      : userRating === 1 ? 'border-red-400 bg-red-100' : 'opacity-20 border-gray-200 bg-gray-50'
                  }`}
                  title="Not helpful"
                >
                  👎
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

const ChatInterface = forwardRef<ChatInterfaceHandle, ChatInterfaceProps>(function ChatInterface({
  onClose,
  pageUrl,
  showBranding = true,
  timezone,
  isDemo = false,
  apiKey,
  isExperimental = false,
  groupId,
  visitorId,
  pageGoal,
  onConversationStart,
  onSessionRestored
}, ref) {
  const posthog = usePostHog()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use provided pageUrl or capture from window
  const effectivePageUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '')

  const {
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
  } = useChat({
    pageUrl: effectivePageUrl,
    apiKey,
    timezone,
    groupId,
    visitorId,
    onError: (err) => console.error('Chat error:', err),
    onResponse: () => {
      setShowSparkleBurst(true)
      setTimeout(() => setShowSparkleBurst(false), 800)
      setHasFirstResponse(true)
    }
  })

  const [inputValue, setInputValue] = useState('')
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

  const [showSparkleBurst, setShowSparkleBurst] = useState(false)

  const [escalationState, setEscalationState] = useState<'hidden' | 'form' | 'success'>('hidden')
  const escalationTrigger = useRef<'thumbs_down' | 'human_help'>('thumbs_down')

  const [email, setEmail] = useState('')
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
  const [escalationError, setEscalationError] = useState('')

  const [userRating, setUserRating] = useState<number | null>(null)
  const [showRatingCheck, setShowRatingCheck] = useState(false)
  const [hasFirstResponse, setHasFirstResponse] = useState(false)

  const closeDataRef = useRef({ sessionId: '', messageCount: 0, pageUrl: effectivePageUrl })

  const greetingMessage = messages.find(m => m.isGreeting)
  const nonGreetingMessages = messages.filter(m => !m.isGreeting)
  const hasConversation = nonGreetingMessages.length > 0
  const hasInputText = inputValue.trim().length > 0
  const isInputDisabled = isLoading || !sessionId

  // Dynamic quick actions based on page goal
  const quickActions = getQuickActionsForGoal((pageGoal as PageGoal) ?? null)
  const showTranslateDropdown = hasTranslateAction(quickActions)
  const nonTranslateActions = quickActions.filter(a => a.key !== 'translate')
  const translateAction = quickActions.find(a => a.key === 'translate')
  const hasDisabledButtons = hasInputRequiredAction(quickActions)

  // Dynamic placeholder based on whether any buttons need input
  const inputPlaceholder = hasDisabledButtons
    ? 'Ask a question, or type text for grayed-out buttons'
    : 'Ask a question or tap a button below'

  // Rating UI: only show if user hasn't rated yet (check both local state AND DB)
  const hasRated = userRating !== null || hasExistingRating
  const canShowRating = hasFirstResponse && (!hasRated || showRatingCheck)
  const lastAIMessageIndex = nonGreetingMessages.map(m => m.role).lastIndexOf('assistant')

  const downloadTranscript = () => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let transcript = `Chat Transcript - ${dateStr}\n`
    transcript += '='.repeat(40) + '\n\n'

    messages.forEach(msg => {
      const time = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        : ''
      const role = msg.role === 'user' ? 'You' : 'Assistant'
      const timeStr = time ? ` [${time}]` : ''
      transcript += `${role}${timeStr}:\n${msg.content}\n\n`
    })

    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-transcript-${now.toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Wrapper to reset local state when starting fresh conversation
  const handleStartFreshConversation = () => {
    // Reset local rating state
    setUserRating(null)
    setShowRatingCheck(false)
    setHasFirstResponse(false)
    setEscalationState('hidden')
    setEmail('')
    setEscalationError('')
    setIsSubmittingEmail(false)
    // Then start fresh in useChat
    startFreshConversation()
  }

  // Expose capabilities to parent via ref
  useImperativeHandle(ref, () => ({
    canDownload: hasConversation,
    downloadTranscript,
    isRestoredSession,
    startFreshConversation: handleStartFreshConversation
  }), [hasConversation, messages, isRestoredSession, startFreshConversation])

  // Start session on mount
  useEffect(() => {
    startSession()
  }, [startSession])

  // Notify parent when conversation starts (for download button visibility)
  useEffect(() => {
    if (hasConversation) {
      onConversationStart?.()
    }
  }, [hasConversation, onConversationStart])

  // Notify parent when session is restored (for refresh button visibility)
  useEffect(() => {
    if (isRestoredSession) {
      onSessionRestored?.()
    }
  }, [isRestoredSession, onSessionRestored])

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

  // Update close data ref for analytics
  useEffect(() => {
    closeDataRef.current = {
      sessionId: sessionId || '',
      messageCount: nonGreetingMessages.length,
      pageUrl: effectivePageUrl
    }
  }, [sessionId, nonGreetingMessages.length, effectivePageUrl])

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

  // Auto-resize textarea when content changes
  useEffect(() => {
    if (!inputRef.current) return
    const textarea = inputRef.current
    textarea.style.height = 'auto'
    if (inputValue) {
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [inputValue])

  // Close language dropdown on outside click
  useEffect(() => {
    if (!showLanguageDropdown) return
    const handleClickOutside = () => setShowLanguageDropdown(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showLanguageDropdown])

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage(inputValue.trim())
    setInputValue('')
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setInputValue(e.target.value)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  function handleRating(rating: number): void {
    if (!sessionId || userRating !== null) return

    setUserRating(rating)

    // Fire API in background
    fetch('/api/conversations/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, rating, api_key: apiKey })
    }).catch(error => console.error('Failed to submit rating:', error))

    if (rating === 1) {
      // Thumbs down: show "Thanks!" briefly, then escalation form
      setShowRatingCheck(true)
      setTimeout(() => {
        setShowRatingCheck(false)
        escalationTrigger.current = 'thumbs_down'
        setEscalationState('form')
        posthog?.capture('negative_feedback_escalation_shown', {
          session_id: sessionId,
          page_url: effectivePageUrl
        })
      }, 800)
    } else {
      // Thumbs up: just show thanks
      setShowRatingCheck(true)
      setTimeout(() => setShowRatingCheck(false), 1500)
    }

    posthog?.capture('feedback_submitted', {
      rating,
      session_id: sessionId,
      page_url: effectivePageUrl,
      message_count: messages.length
    })
  }

  async function handleEmailSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()

    if (!sessionId) {
      setEscalationError('Conversation not started yet')
      return
    }

    if (!isValidEmail(email)) {
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

      setEmail('')
      setEscalationState('success')
      posthog?.capture('escalation_submitted', {
        session_id: sessionId,
        page_url: effectivePageUrl,
        message_count: messages.length
      })
    } catch (error) {
      setEscalationError(error instanceof Error ? error.message : 'Failed to submit email')
    } finally {
      setIsSubmittingEmail(false)
    }
  }

  function handleQuickAction(action: QuickAction, language?: string): void {
    let fullMessage: string

    if (action.key === 'translate' && language) {
      // Translate: special case with language parameter
      if (!inputValue.trim()) return
      fullMessage = `${action.prepend} ${language}: ${inputValue.trim()}`
    } else if (action.requiresInput) {
      // Input-required actions: prepend to user text
      if (!inputValue.trim()) return
      fullMessage = `${action.prepend} ${inputValue.trim()}`
    } else {
      // Zero-input actions: send the prompt directly (may append user text if present)
      fullMessage = inputValue.trim()
        ? `${action.prompt}\n\nContext: ${inputValue.trim()}`
        : action.prompt
    }

    sendMessage(fullMessage, {
      skipFileSearch: action.key === 'translate',
      quickAction: action.key
    })
    setInputValue('')
    setShowLanguageDropdown(false)
  }

  return (
    <div className="relative h-full flex flex-col bg-white">
      {/* Sparkle Burst - at top level to avoid overflow clipping */}
      <AnimatePresence>
        {showSparkleBurst && <SparkleBurst />}
      </AnimatePresence>

      {/* ====================================================================
          SCROLLABLE CONVERSATION AREA (Top)
          ==================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Greeting - shown as AI chat bubble */}
        {greetingMessage && (
          <ChatBubble
            message={greetingMessage}
            isNew={false}
            userRating={userRating}
            hasFirstResponse={hasFirstResponse}
            showRatingCheck={showRatingCheck}
            onRate={handleRating}
          />
        )}

        {/* Conversation Messages - inline, standard chat layout */}
        {nonGreetingMessages.map((message, idx) => (
          <ChatBubble
            key={message.id}
            message={message}
            isNew={idx === nonGreetingMessages.length - 1}
            showRating={idx === lastAIMessageIndex && canShowRating}
            userRating={userRating}
            hasFirstResponse={hasFirstResponse}
            showRatingCheck={showRatingCheck}
            onRate={handleRating}
            pageGoal={pageGoal}
          />
        ))}

        {/* Loading State - Typing Dots */}
        <AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ====================================================================
          FIXED INPUT SECTION (Bottom)
          ==================================================================== */}
      <div className="flex-shrink-0 p-4 space-y-3">
        {/* Input Area */}
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              disabled={isInputDisabled}
              className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:bg-white disabled:opacity-50 resize-none overflow-y-auto"
            />
            <button
              type="submit"
              disabled={isLoading || !hasInputText || !sessionId}
              className="p-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors"
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
              className="text-red-500 text-xs text-center mt-2"
            >
              {error}
            </motion.div>
          )}
        </form>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Translate with dropdown (only if this goal has translate) */}
          {showTranslateDropdown && translateAction && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (hasInputText) setShowLanguageDropdown(!showLanguageDropdown)
                }}
                disabled={!hasInputText || isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all duration-150 ${
                  hasInputText && !isLoading
                    ? 'bg-white hover:bg-gradient-to-r hover:from-rose-500 hover:to-orange-500 border-gray-200 text-orange-600 hover:text-white hover:border-transparent shadow-sm hover:shadow'
                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <translateAction.icon className="w-3.5 h-3.5" />
                <span>Translate</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Language dropdown - opens upward since we're at bottom */}
              <AnimatePresence>
                {showLanguageDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {TRANSLATE_LANGUAGES.map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => handleQuickAction(translateAction, label)}
                        className="w-full px-4 py-2 text-xs text-left text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                      >
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Other action buttons */}
          {nonTranslateActions.map((action) => (
            <QuickActionButton
              key={action.key}
              icon={action.icon}
              label={action.label}
              disabled={action.requiresInput ? (!hasInputText || isLoading) : isLoading}
              onClick={() => handleQuickAction(action)}
            />
          ))}
        </div>
      </div>

      {/* ====================================================================
          FIXED FOOTER: Escalation Form + Branding (Very Bottom)
          ==================================================================== */}
      {(escalationState !== 'hidden' || showBranding || !!sessionId) && (
        <div className="flex-shrink-0 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 py-1.5 px-3">
          {/* Escalation Form/Success - animated tray */}
          <AnimatePresence>
            {hasConversation && escalationState !== 'hidden' && (
              <motion.div
                key="escalation-tray"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="w-full max-w-md mx-auto pt-1.5 pb-2">
                  <AnimatePresence mode="wait">
                    {/* Email Form UI */}
                    {escalationState === 'form' && (
                      <motion.div
                        key="escalation-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-lg p-3 space-y-2"
                      >
                        <p className="text-gray-700 text-sm text-center">
                          {escalationTrigger.current === 'human_help'
                            ? 'Leave your email and we\u2019ll follow up personally.'
                            : 'Sorry that wasn\u2019t helpful. Want us to follow up?'}
                        </p>
                        <form onSubmit={handleEmailSubmit} className="space-y-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            disabled={isSubmittingEmail}
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:bg-white disabled:opacity-50"
                          />
                          {escalationError && (
                            <div className="text-red-500 text-xs text-center">{escalationError}</div>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              disabled={isSubmittingEmail || !email.trim()}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                            >
                              {isSubmittingEmail ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              <span>{isSubmittingEmail ? 'Sending...' : 'Send'}</span>
                            </button>
                          </div>
                        </form>
                        <button
                          onClick={() => setEscalationState('hidden')}
                          className="w-full text-gray-400 hover:text-gray-600 text-xs transition-colors"
                        >
                          No thanks
                        </button>
                      </motion.div>
                    )}

                    {/* Success message - shown after email submitted */}
                    {escalationState === 'success' && (
                      <motion.div
                        key="escalation-success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center gap-2 text-white text-sm py-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>We&apos;ll be in touch!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer links: human help + branding */}
          {(() => {
            const showHumanHelp = !!sessionId && escalationState === 'hidden'
            return (showHumanHelp || showBranding) ? (
              <div className={`flex items-center ${
                showHumanHelp && showBranding ? 'justify-between' : 'justify-center'
              }`}>
                {showHumanHelp && (
                  <button
                    onClick={() => {
                      escalationTrigger.current = 'human_help'
                      setEscalationState('form')
                      posthog?.capture('human_help_clicked', {
                        session_id: sessionId,
                        page_url: effectivePageUrl
                      })
                    }}
                    className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Need help? Talk to a human</span>
                  </button>
                )}
                {showBranding && (
                  <a
                    href="https://easyask.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/70 hover:text-white transition-colors"
                  >
                    Powered by EasyAsk
                  </a>
                )}
              </div>
            ) : null
          })()}
        </div>
      )}
    </div>
  )
})

export default ChatInterface
