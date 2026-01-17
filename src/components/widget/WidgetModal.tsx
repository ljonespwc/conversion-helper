'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import ChatInterface from './ChatInterface'

interface WidgetModalProps {
  onClose: () => void
  pageUrl?: string
  organizationName?: string
  showBranding?: boolean
  timezone?: string
  isDemo?: boolean
  apiKey?: string
  isExperimental?: boolean
}

export default function WidgetModal({ onClose, pageUrl, organizationName, showBranding = true, timezone, isDemo = false, apiKey, isExperimental = false }: WidgetModalProps) {

  // In demo mode, the widget is rendered directly (not in widget.js iframe)
  // so we need padding and max-width constraints
  // In production, the iframe is sized to the modal, so we fill it completely
  const isInIframe = typeof window !== 'undefined' && window.parent !== window && !isDemo

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${isDemo ? 'p-4' : ''}`}
      onClick={onClose}
      style={isDemo ? { pointerEvents: 'none' } : undefined}
    >
      {/* No backdrop - in production iframe is sized to modal, in demo we use pointer-events */}

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white dark:bg-easyask-dark rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          isInIframe
            ? 'w-full h-full'
            : isExperimental
              ? 'w-full max-w-[800px] sm:min-w-[500px]'
              : 'w-full max-w-md min-w-[400px]'
        }`}
        style={isDemo ? { pointerEvents: 'auto' } : undefined}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {/* Spacer for symmetry */}
          <div className="w-8" />

          {/* Title in center */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isDemo ? 'EasyAsk Demo Assistant' : (organizationName ? `${organizationName} Learning Assistant` : 'Page Assistant')}
          </h2>

          {/* Close button on the right */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatInterface onClose={onClose} pageUrl={pageUrl} showBranding={showBranding} timezone={timezone} isDemo={isDemo} apiKey={apiKey} isExperimental={isExperimental} />
        </div>
      </motion.div>
    </motion.div>
  )
}