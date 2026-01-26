'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Download, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'
import ChatInterface, { ChatInterfaceHandle } from './ChatInterface'

interface WidgetModalProps {
  onClose: () => void
  pageUrl?: string
  organizationName?: string
  showBranding?: boolean
  timezone?: string
  isDemo?: boolean
  apiKey?: string
  isExperimental?: boolean
  groupId?: string
  position?: 'bottom-left' | 'bottom-right'
  isWidened?: boolean
  onToggleWidth?: () => void
  viewportWidth?: number
}

export default function WidgetModal({ onClose, pageUrl, organizationName, showBranding = true, timezone, isDemo = false, apiKey, isExperimental = false, groupId, position = 'bottom-right', isWidened = false, onToggleWidth, viewportWidth = 0 }: WidgetModalProps) {
  const isLeft = position === 'bottom-left'
  const chatRef = useRef<ChatInterfaceHandle>(null)
  const [canDownload, setCanDownload] = useState(false)
  const [showRefresh, setShowRefresh] = useState(false)
  const canExpand = viewportWidth >= 768

  const handleDownload = () => {
    chatRef.current?.downloadTranscript()
  }

  const handleRefresh = () => {
    chatRef.current?.startFreshConversation()
    setShowRefresh(false)
    setCanDownload(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
      onClick={onClose}
      style={{ pointerEvents: 'none' }}
    >
      {/* No backdrop - iframe is sized to modal, clicks pass through to page */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-0 ${isLeft ? 'left-0' : 'right-0'} w-full ${isWidened ? 'sm:w-[min(800px,calc(100vw-2rem))]' : 'sm:w-[460px]'} h-full max-h-[600px] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col border-2 border-orange-400/50 transition-[width] duration-300 ease-in-out`}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center justify-between p-4 flex-shrink-0 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400">
          {/* Left side: Expand, Download, and/or Refresh buttons */}
          <div className="flex items-center gap-1">
            {canExpand && onToggleWidth && (
              <button
                onClick={onToggleWidth}
                className="p-1.5 rounded-full border border-white/30 hover:bg-white/20 transition-colors"
                aria-label={isWidened ? 'Collapse width' : 'Expand width'}
                title={isWidened ? 'Collapse width' : 'Expand width'}
              >
                {isWidened ? <Minimize2 className="w-4 h-4 text-white" /> : <Maximize2 className="w-4 h-4 text-white" />}
              </button>
            )}
            {canDownload && (
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-full border border-white/30 hover:bg-white/20 transition-colors"
                aria-label="Save transcript"
                title="Save transcript"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            )}
            {showRefresh && (
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-full border border-white/30 hover:bg-white/20 transition-colors"
                aria-label="Start new conversation"
                title="Start new conversation"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            )}
            {!canExpand && !canDownload && !showRefresh && <div className="w-8" />}
          </div>

          {/* Title in center */}
          <h2 className="text-lg font-semibold text-white">
            {isDemo ? 'EasyAsk Demo Assistant' : (organizationName ? `${organizationName} Answers` : 'Page Assistant')}
          </h2>

          {/* Close button on the right */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-white/30 hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatInterface
            ref={chatRef}
            onClose={onClose}
            pageUrl={pageUrl}
            showBranding={showBranding}
            timezone={timezone}
            isDemo={isDemo}
            apiKey={apiKey}
            isExperimental={isExperimental}
            groupId={groupId}
            onConversationStart={() => setCanDownload(true)}
            onSessionRestored={() => setShowRefresh(true)}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
