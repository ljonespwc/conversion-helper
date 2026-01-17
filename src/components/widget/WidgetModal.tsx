'use client'

import { useEffect, useRef } from 'react'
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
  const modalRef = useRef<HTMLDivElement>(null)

  // In production (iframe), observe modal size changes and tell parent to resize iframe
  useEffect(() => {
    if (isDemo || typeof window === 'undefined' || window.parent === window) return

    const modal = modalRef.current
    if (!modal) return

    const sendSize = () => {
      const rect = modal.getBoundingClientRect()
      // Add padding for shadow (16px each side)
      const width = Math.ceil(rect.width) + 32
      const height = Math.ceil(rect.height) + 32
      window.parent.postMessage({ type: 'easyask:modalsize', width, height }, '*')
    }

    // Delay starting observation to let iframe expand first
    let observer: ResizeObserver | null = null
    const timeout = setTimeout(() => {
      sendSize()
      observer = new ResizeObserver(sendSize)
      observer.observe(modal)
    }, 150)

    return () => {
      clearTimeout(timeout)
      observer?.disconnect()
    }
  }, [isDemo])

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
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white dark:bg-easyask-dark rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          isExperimental
            ? 'w-full max-w-[800px] sm:min-w-[500px]'
            : 'w-full max-w-md min-w-[400px]'
        }`}
        style={{ pointerEvents: 'auto' }}
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