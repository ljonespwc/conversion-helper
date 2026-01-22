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
  groupId?: string
}

export default function WidgetModal({ onClose, pageUrl, organizationName, showBranding = true, timezone, isDemo = false, apiKey, isExperimental = false, groupId }: WidgetModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ pointerEvents: 'none' }}
    >
      {/* No backdrop - iframe is sized to modal, clicks pass through to page */}

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative rounded-3xl overflow-hidden flex flex-col backdrop-blur-md ${
          isExperimental
            ? 'w-[420px] h-[568px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)]'
            : 'w-[700px] h-[618px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)]'
        }`}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Gradient border ring */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            padding: '2px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor'
          }}
        />
        <div className="flex items-center justify-between p-4 flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-500">
          {/* Spacer for symmetry */}
          <div className="w-8" />

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
          <ChatInterface onClose={onClose} pageUrl={pageUrl} showBranding={showBranding} timezone={timezone} isDemo={isDemo} apiKey={apiKey} isExperimental={isExperimental} groupId={groupId} />
        </div>
      </motion.div>
    </motion.div>
  )
}