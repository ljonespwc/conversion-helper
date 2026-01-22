'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, Copy, Check, Sparkles, MessageCircle, ChevronDown, ChevronUp, Mail, Send, Languages, Lightbulb, FileText, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useChat, ChatMessage } from '@/hooks/useChat'
import { usePostHog } from 'posthog-js/react'

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

const QUICK_ACTION_PREFIXES: Record<string, string> = {
  translate: 'Translate this to',
  explain: 'Explain this simply:',
  summarize: 'Summarize this:',
  define: 'Define the key terms in this:'
}

const QUICK_ACTIONS = [
  { key: 'explain', label: 'Explain Simply', icon: Lightbulb },
  { key: 'summarize', label: 'Summarize', icon: FileText },
  { key: 'define', label: 'Define Terms', icon: BookOpen }
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
}

interface CopyButtonProps {
  isCopied: boolean
  onCopy: () => void
  label: string
  copiedLabel?: string
  className?: string
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  disabled: boolean
  onClick: () => void
}

interface ExpandableButtonProps {
  isExpanded: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  className?: string
}

interface ThumbButtonProps {
  emoji: string
  rating: number
  currentRating: number | null
  otherRating: number
  hasFirstResponse: boolean
  onRate: (rating: number) => void
  title: string
}

// ============================================================================
// Markdown Rendering Configuration
// ============================================================================

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-blue-600">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-gray-600">{children}</em>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="text-gray-700">{children}</li>,
  code: ({ children }: { children?: React.ReactNode }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 text-xs">{children}</code>,
}

const historyMarkdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-1 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-purple-600">{children}</strong>,
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatTimeShort(timestamp: Date | number | string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatConversationForCopy(messages: ChatMessage[]): string {
  const conversationText = messages
    .filter(m => !m.isGreeting)
    .map((msg) => {
      const time = formatTimeShort(msg.timestamp)
      const role = msg.role === 'user' ? 'You' : 'Assistant'
      return `[${time}] ${role}: ${msg.content}`
    })
    .join('\n\n')

  const header = `Conversation Transcript - ${new Date().toLocaleString()}\n${'='.repeat(60)}\n\n`
  return header + conversationText
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function getThumbButtonFilter(
  userRating: number | null,
  thisRating: number,
  otherRating: number,
  hasFirstResponse: boolean
): string {
  if (userRating === otherRating) {
    return 'grayscale(100%) opacity(0.4)'
  }
  if (hasFirstResponse) {
    return 'none'
  }
  return 'grayscale(100%) opacity(0.5)'
}

// ============================================================================
// Sub-Components
// ============================================================================

function CopyButton({ isCopied, onCopy, label, copiedLabel = 'Copied!', className = '' }: CopyButtonProps): JSX.Element {
  return (
    <button
      onClick={onCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${className}`}
    >
      {isCopied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}

function QuickActionButton({ icon: Icon, label, disabled, onClick }: QuickActionButtonProps): JSX.Element {
  const baseClasses = 'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all'
  const enabledClasses = 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-800 shadow-sm'
  const disabledClasses = 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'

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

function ExpandableButton({ isExpanded, onClick, icon: Icon, label, className = '' }: ExpandableButtonProps): JSX.Element {
  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2 transition-colors text-sm shadow-sm ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      <ChevronIcon className="w-4 h-4" />
    </button>
  )
}

function ThumbButton({ emoji, rating, currentRating, otherRating, hasFirstResponse, onRate, title }: ThumbButtonProps): JSX.Element {
  const isDisabled = currentRating !== null
  const filter = getThumbButtonFilter(currentRating, rating, otherRating, hasFirstResponse)

  return (
    <button
      onClick={() => onRate(rating)}
      disabled={isDisabled}
      className={`text-xl transition-all duration-300 ${!isDisabled ? 'cursor-pointer hover:scale-110' : ''}`}
      style={{
        filter,
        transition: 'filter 0.5s, transform 0.2s'
      }}
      title={title}
    >
      {emoji}
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
            className="w-2 h-2 bg-blue-500 rounded-full"
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

function MessageAvatar({ role }: { role: 'user' | 'assistant' }): JSX.Element {
  if (role === 'user') {
    return (
      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-xs text-blue-600">You</span>
      </div>
    )
  }
  return (
    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
      <Sparkles className="w-3 h-3 text-purple-500" />
    </div>
  )
}

function HistoryMessage({ message, animationDelay }: { message: ChatMessage; animationDelay: number }): JSX.Element {
  const roleLabel = message.role === 'user' ? 'You' : 'Assistant'
  const roleColorClass = message.role === 'user' ? 'text-blue-600' : 'text-purple-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className="flex gap-3"
    >
      <div className="flex-shrink-0 mt-0.5">
        <MessageAvatar role={message.role} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium ${roleColorClass}`}>
            {roleLabel}
          </span>
          <span className="text-xs text-gray-400">
            {formatTimeShort(message.timestamp)}
          </span>
        </div>
        <div className="text-sm text-gray-600 leading-relaxed">
          {message.role === 'assistant' ? (
            <ReactMarkdown components={historyMarkdownComponents}>
              {message.content}
            </ReactMarkdown>
          ) : (
            message.content
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function ChatInterface({
  onClose,
  pageUrl,
  showBranding = true,
  timezone,
  isDemo = false,
  apiKey,
  isExperimental = false,
  groupId
}: ChatInterfaceProps): JSX.Element {
  const posthog = usePostHog()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use provided pageUrl or capture from window
  const effectivePageUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '')

  // --------------------------------------------------------------------------
  // Chat Hook
  // --------------------------------------------------------------------------
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
    groupId,
    onError: (err) => console.error('Chat error:', err),
    onResponse: () => {
      setShowSparkleBurst(true)
      setTimeout(() => setShowSparkleBurst(false), 800)
      setHasFirstResponse(true)
    }
  })

  // --------------------------------------------------------------------------
  // Input State
  // --------------------------------------------------------------------------
  const [inputValue, setInputValue] = useState('')
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

  // --------------------------------------------------------------------------
  // UI Feedback State
  // --------------------------------------------------------------------------
  const [isCopied, setIsCopied] = useState(false)
  const [isConversationCopied, setIsConversationCopied] = useState(false)
  const [showSparkleBurst, setShowSparkleBurst] = useState(false)

  // --------------------------------------------------------------------------
  // Expandable Sections State
  // --------------------------------------------------------------------------
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)

  // --------------------------------------------------------------------------
  // Escalation State
  // --------------------------------------------------------------------------
  const [escalationState, setEscalationState] = useState<'hidden' | 'form' | 'success'>('hidden')

  // --------------------------------------------------------------------------
  // Email Escalation State
  // --------------------------------------------------------------------------
  const [email, setEmail] = useState('')
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
  const [escalationSuccess, setEscalationSuccess] = useState(false)
  const [escalationError, setEscalationError] = useState('')

  // --------------------------------------------------------------------------
  // Rating State
  // --------------------------------------------------------------------------
  const [userRating, setUserRating] = useState<number | null>(null)
  const [showRatingCheck, setShowRatingCheck] = useState(false)
  const [hasFirstResponse, setHasFirstResponse] = useState(false)

  // --------------------------------------------------------------------------
  // Analytics Tracking Ref
  // --------------------------------------------------------------------------
  const closeDataRef = useRef({ sessionId: '', messageCount: 0, pageUrl: effectivePageUrl })

  // --------------------------------------------------------------------------
  // Derived State
  // --------------------------------------------------------------------------
  const lastResponse = messages.filter(m => m.role === 'assistant' && !m.isGreeting).slice(-1)[0]
  const greetingMessage = messages.find(m => m.isGreeting)
  const nonGreetingMessages = messages.filter(m => !m.isGreeting)
  const hasConversation = nonGreetingMessages.length > 0
  const hasInputText = inputValue.trim().length > 0
  const isInputDisabled = isLoading || !sessionId

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

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

  async function handleCopyResponse(text: string): Promise<void> {
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

  async function handleCopyConversation(): Promise<void> {
    if (messages.length === 0) return

    try {
      const text = formatConversationForCopy(messages)
      await navigator.clipboard.writeText(text)
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

  function handleRating(rating: number): void {
    if (!sessionId || userRating !== null) return

    setUserRating(rating)

    // Fire API in background
    fetch('/api/conversations/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, rating })
    }).catch(error => console.error('Failed to submit rating:', error))

    if (rating === 1) {
      // Thumbs down: show "Thanks!" briefly, then escalation form
      setShowRatingCheck(true)
      setTimeout(() => {
        setShowRatingCheck(false)
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

      setEscalationSuccess(true)
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

  function handleQuickAction(action: string, language?: string): void {
    if (!inputValue.trim()) return

    const prefix = action === 'translate'
      ? `${QUICK_ACTION_PREFIXES.translate} ${language}:`
      : QUICK_ACTION_PREFIXES[action]

    const fullMessage = `${prefix} ${inputValue.trim()}`
    sendMessage(fullMessage)
    setInputValue('')
    setShowLanguageDropdown(false)
  }

  function handleHistoryToggle(): void {
    const newExpanded = !isHistoryExpanded
    setIsHistoryExpanded(newExpanded)
    if (newExpanded) {
      posthog?.capture('conversation_history_viewed', {
        page_url: effectivePageUrl,
        conversation_id: sessionId,
        message_count: messages.length
      })
    }
  }


  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className={`relative h-full flex flex-col ${!hasConversation && !isLoading ? 'justify-center' : ''}`}>
      {/* Sparkle Burst - at top level to avoid overflow clipping */}
      <AnimatePresence>
        {showSparkleBurst && <SparkleBurst />}
      </AnimatePresence>

      {/* Fixed top section: Input + Quick Actions */}
      <div className={`flex-shrink-0 p-6 pb-4 space-y-4 ${hasConversation || isLoading ? 'border-b border-gray-200/30' : ''}`}>
        {/* Greeting - shown before any conversation */}
        {greetingMessage && !hasConversation && (
          <p className="text-center text-gray-500 text-sm">{greetingMessage.content}</p>
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
              disabled={isInputDisabled}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-50 resize-none overflow-y-auto shadow-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !hasInputText || !sessionId}
              className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
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
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Start new conversation
              </button>
            </div>
          )}
        </form>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Translate with dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (hasInputText) setShowLanguageDropdown(!showLanguageDropdown)
              }}
              disabled={!hasInputText || isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
                hasInputText && !isLoading
                  ? 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-800 shadow-sm'
                  : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
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
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {TRANSLATE_LANGUAGES.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => handleQuickAction('translate', label)}
                      className="w-full px-4 py-2 text-xs text-left text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Other action buttons */}
          {QUICK_ACTIONS.map(({ key, label, icon }) => (
            <QuickActionButton
              key={key}
              icon={icon}
              label={label}
              disabled={!hasInputText || isLoading}
              onClick={() => handleQuickAction(key)}
            />
          ))}
        </div>
      </div>

      {/* Scrollable content section - only show when there's content */}
      {(isLoading || hasConversation || showBranding) && (
        <div className={`overflow-y-auto p-6 pt-4 space-y-4 ${hasConversation ? 'flex-1' : ''}`}>
          {/* Loading State - Typing Dots */}
          <AnimatePresence>
            {isLoading && <TypingIndicator />}
          </AnimatePresence>

          {/* Response Display */}
          <div className={`w-full ${isExperimental ? '' : 'max-w-2xl mx-auto'}`}>
            <AnimatePresence>
              {lastResponse && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className={`flex-1 min-w-0 text-gray-700 leading-relaxed ${isExperimental ? 'text-sm' : 'text-base'}`}>
                          <ReactMarkdown components={markdownComponents}>
                            {lastResponse.content}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* Copy Button */}
                      <div className="mt-3 flex items-center justify-end">
                        <CopyButton
                          isCopied={isCopied}
                          onCopy={() => handleCopyResponse(lastResponse.content)}
                          label="Copy"
                          className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Conversation History - Default mode (non-experimental) */}
          {!isExperimental && hasConversation && (
            <div className="w-full max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <ExpandableButton
                  isExpanded={isHistoryExpanded}
                  onClick={handleHistoryToggle}
                  icon={MessageCircle}
                  label={`${isHistoryExpanded ? 'Hide' : 'View'} conversation (${nonGreetingMessages.length} messages)`}
                  className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700"
                />

                <AnimatePresence>
                  {isHistoryExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-100 rounded-lg border border-gray-200 p-4 space-y-3">
                        <div className="space-y-3">
                          {nonGreetingMessages.map((message, idx) => (
                            <HistoryMessage
                              key={message.id}
                              message={message}
                              animationDelay={idx * 0.05}
                            />
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="pt-2 border-t border-gray-300 flex justify-end">
                          <CopyButton
                            isCopied={isConversationCopied}
                            onCopy={handleCopyConversation}
                            label="Copy conversation"
                            className="text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

        </div>
      )}

      {/* Fixed bottom section: Rating/Escalation + Branding */}
      {(hasConversation || showBranding) && (
        <div className="flex-shrink-0 p-4 pt-2 space-y-2 bg-gradient-to-r from-blue-500 to-purple-500">
          {/* Rating / Escalation - Unified component */}
          {hasConversation && (
            <div className="w-full max-w-md mx-auto">
              <AnimatePresence mode="wait">
                {/* Rating UI - shown when escalation is hidden */}
                {escalationState === 'hidden' && (
                  <motion.div
                    key="rating"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <AnimatePresence mode="wait">
                      {showRatingCheck ? (
                        <motion.div
                          key="checkmark"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="flex items-center gap-1 text-white text-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>Thanks!</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="thumbs"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <span className={`text-xs transition-colors duration-500 ${
                            hasFirstResponse ? 'text-white' : 'text-white/60'
                          }`}>
                            Did this help?
                          </span>
                          <div className="flex items-center gap-4">
                            <ThumbButton
                              emoji="👎"
                              rating={1}
                              currentRating={userRating}
                              otherRating={5}
                              hasFirstResponse={hasFirstResponse}
                              onRate={handleRating}
                              title="Not helpful"
                            />
                            <ThumbButton
                              emoji="👍"
                              rating={5}
                              currentRating={userRating}
                              otherRating={1}
                              hasFirstResponse={hasFirstResponse}
                              onRate={handleRating}
                              title="Helpful"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Email Form UI - shown after thumbs down */}
                {escalationState === 'form' && (
                  <motion.div
                    key="escalation-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-3"
                  >
                    <p className="text-white text-sm text-center">
                      Sorry that wasn&apos;t helpful. Want us to follow up?
                    </p>
                    <form onSubmit={handleEmailSubmit} className="space-y-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        disabled={isSubmittingEmail}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
                      />
                      {escalationError && (
                        <div className="text-red-200 text-xs text-center">{escalationError}</div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSubmittingEmail || !email.trim()}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 disabled:bg-white/50 disabled:cursor-not-allowed text-blue-600 text-sm font-medium rounded-md transition-colors"
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
                      className="w-full text-white/70 hover:text-white text-xs transition-colors"
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
                    className="flex items-center justify-center gap-2 text-white text-sm py-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>We&apos;ll be in touch!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Powered by EasyAsk Footer */}
          {showBranding && (
            <div className="flex items-center justify-center">
              <a
                href="https://easyask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/70 hover:text-white transition-colors"
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
