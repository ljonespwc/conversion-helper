'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

interface WidgetButtonProps {
  onClick: () => void
  pageUrl?: string
  pageTitle?: string
  position?: 'bottom-left' | 'bottom-right'
  line1?: string
  line2?: string
}

// Default fallback copy
const DEFAULT_LINE1 = "Got questions? Just ask!"
const DEFAULT_LINE2 = "💬 Instant answers"

export default function WidgetButton({ onClick, position = 'bottom-right', line1, line2 }: WidgetButtonProps) {
  const isLeft = position === 'bottom-left'
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className={`group fixed bottom-4 ${isLeft ? 'left-4' : 'right-4'} z-40 shadow-xl h-[60px]`}
      aria-label="Open chat assistant"
      style={{
        width: 'auto',
        minWidth: '180px',
        maxWidth: '460px',
        borderRadius: '30px',
      }}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600"
        style={{ borderRadius: '30px' }}
      />

      {/* Breathing Pulse Effect */}
      <motion.div
        className="absolute inset-0 bg-white opacity-20"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ borderRadius: '30px' }}
      />

      {/* Content Container */}
      <div className="relative flex items-center justify-center h-full px-4 gap-2">
        {/* Message Icon */}
        <div className="flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center overflow-hidden whitespace-nowrap gap-1">
          <span className="text-sm font-semibold text-white leading-tight text-center">
            {line1 || DEFAULT_LINE1}
          </span>
          <span className="text-xs text-blue-100 leading-tight text-center">
            {line2 || DEFAULT_LINE2}
          </span>
        </div>
      </div>
    </motion.button>
  )
}
