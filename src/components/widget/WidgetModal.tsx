'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Wifi, WifiOff } from 'lucide-react'
import SimplifiedVoiceInterface from './SimplifiedVoiceInterface'

interface WidgetModalProps {
  onClose: () => void
  pageUrl?: string
  organizationName?: string
  showBranding?: boolean
  timezone?: string
}

export default function WidgetModal({ onClose, pageUrl, organizationName, showBranding = true, timezone }: WidgetModalProps) {
  const [isConnected, setIsConnected] = useState(false)

  // Listen for connection status updates
  useEffect(() => {
    (window as any).updateConnectionStatus = setIsConnected
    return () => {
      delete (window as any).updateConnectionStatus
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
      style={{ pointerEvents: 'none' }} // Allow clicks through to page content
    >
      {/*
        BACKDROP REMOVED: Allows users to scroll and interact with page while modal is open

        TO REVERT TO ORIGINAL BEHAVIOR (blurred backdrop, no scrolling):
        1. Uncomment the backdrop div below
        2. Remove the `style={{ pointerEvents: 'none' }}` from this container (line above)
        3. Remove the `style={{ pointerEvents: 'auto' }}` from the modal card below
      */}
      {/* <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" /> */}

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-easyask-dark rounded-2xl shadow-2xl w-full max-w-md min-w-[400px] overflow-hidden"
        style={{ pointerEvents: 'auto' }} // Modal card itself remains interactive
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {/* WiFi indicator on the left */}
          <div className="w-8 flex items-center">
            <div className="p-1.5 rounded-full border-2 border-gray-300 dark:border-gray-600">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Title in center */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {organizationName ? `${organizationName} Assistant` : 'Page Assistant'}
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

        <SimplifiedVoiceInterface onClose={onClose} pageUrl={pageUrl} showBranding={showBranding} timezone={timezone} />
      </motion.div>
    </motion.div>
  )
}