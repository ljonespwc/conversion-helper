'use client'

import { useState, useEffect } from 'react'
import { Mic, Volume2, Loader2, ExternalLink, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useLayercodeVoice } from '@/hooks/useSimpleLayercodeVoice'
import type { ExtractedLink, URLExtractionResult } from '@/lib/url-extractor'

interface SimplifiedVoiceInterfaceProps {
  onClose: () => void
  pageUrl?: string
}

export default function SimplifiedVoiceInterface({ onClose, pageUrl }: SimplifiedVoiceInterfaceProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [hasHadFirstInteraction, setHasHadFirstInteraction] = useState(false)
  const [currentURLs, setCurrentURLs] = useState<URLExtractionResult | null>(null)
  const [showURLs, setShowURLs] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<string | null>(null)
  const [responseType, setResponseType] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)

  // Use provided pageUrl or capture from window if not provided
  const effectivePageUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '')

  const {
    isConnected,
    isConnecting,
    connectionStatus,
    userAudioLevel,
    agentAudioLevel,
    startNewConversation
  } = useLayercodeVoice({
    metadata: {
      source: 'easyask-assistant',
      ...(effectivePageUrl && { page_url: effectivePageUrl }),
      timestamp: new Date().toISOString()
    },
    onDataMessage: (data) => {
      // Extract content from either wrapped or direct structure
      const content = data?.content || data

      // Capture AI response text
      if (content?.response) {
        setCurrentResponse(content.response)
        setResponseType(content.type || null)
      }

      // Capture URLs (existing logic)
      if (content?.urls?.hasLinks) {
        setCurrentURLs(content.urls)
        setShowURLs(true)
      }
    }
  })

  // Auto-start conversation when connected
  useEffect(() => {
    if (isConnected && !hasStarted) {
      setHasStarted(true)
      // Conversation starts automatically - user can just speak
    }
  }, [isConnected, hasStarted])

  // Handle end conversation
  const handleEndConversation = () => {
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
    } catch (err) {
      console.error('Failed to copy:', err)
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
  // Lower threshold for user speaking detection (was 0.1, now 0.01)
  const isSpeaking = userAudioLevel > 0.01
  const isListening = agentAudioLevel > 0.05  // Keep agent threshold slightly higher
  const isActive = hasStarted && isConnected

  // Track first interaction
  useEffect(() => {
    if ((isSpeaking || isListening) && !hasHadFirstInteraction) {
      setHasHadFirstInteraction(true)
    }
  }, [isSpeaking, isListening, hasHadFirstInteraction])

  // Clear response text and URLs when user starts speaking (asking next question)
  useEffect(() => {
    if (isSpeaking) {
      if (showURLs) setShowURLs(false)
      if (currentResponse) {
        setCurrentResponse(null)
        setResponseType(null)
      }
    }
  }, [isSpeaking, showURLs, currentResponse])

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

      {/* Main Interface */}
      <div className="flex flex-col items-center space-y-4">
        {/* Voice Button */}
        <motion.button
          onClick={() => {
            if (!hasStarted && isConnected) {
              setHasStarted(true)
            }
          }}
          disabled={!isConnected || (hasStarted && isActive)}
          className={`relative p-8 rounded-full transition-all ${getButtonColor()} ${
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

        {/* Status Text - Fixed height container */}
        <div className="h-5 flex items-center justify-center">
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400 text-center"
            key={getStatusText()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getStatusText()}
          </motion.p>
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
                        <Volume2 className="w-4 h-4 text-blue-400" />
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
                    <div className="mt-3 flex justify-end">
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

    </div>
  )
}