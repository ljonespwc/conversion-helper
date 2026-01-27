'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

interface WidgetButtonProps {
  onClick: () => void
  onCollapse?: () => void
  isCollapsed?: boolean
  pageUrl?: string
  pageTitle?: string
  position?: 'bottom-left' | 'bottom-right'
  line1?: string
  line2?: string
}

// Default fallback copy
const DEFAULT_LINE1 = "Got questions? Just ask!"
const DEFAULT_LINE2 = "💬 Instant answers"

export default function WidgetButton({ onClick, onCollapse, isCollapsed = false, position = 'bottom-right', line1, line2 }: WidgetButtonProps) {
  const isLeft = position === 'bottom-left'
  const posClass = isLeft ? 'left-4' : 'right-4'

  return (
    <AnimatePresence mode="wait">
      {isCollapsed ? (
        /* ── Collapsed circle ── */
        <motion.button
          key="collapsed"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClick}
          className={`fixed bottom-4 ${posClass} z-40 shadow-lg`}
          aria-label="Open chat assistant"
          style={{ width: '46px', height: '46px', borderRadius: '50%' }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500"
            style={{ borderRadius: '50%' }}
          />
          <div className="relative flex items-center justify-center h-full">
            <MessageCircle className="w-5 h-5 text-gray-900" />
          </div>
        </motion.button>
      ) : (
        /* ── Full pill ── */
        <motion.button
          key="pill"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClick}
          className={`group fixed bottom-4 ${posClass} z-40 shadow-xl h-[60px]`}
          aria-label="Open chat assistant"
          style={{
            width: 'auto',
            minWidth: '180px',
            maxWidth: 'calc(100vw - 32px)',
            borderRadius: '30px',
            overflow: 'visible',
          }}
        >
          {/* Gradient Background */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 pointer-events-none"
            style={{ borderRadius: '30px' }}
          />

          {/* Breathing Pulse Effect */}
          <motion.div
            className="absolute inset-0 bg-white opacity-20 pointer-events-none"
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

          {/* Collapse X button */}
          {onCollapse && (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onCollapse() }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onCollapse() } }}
              className={`absolute -top-2 sm:-top-1.5 ${isLeft ? '-right-2 sm:-right-1.5' : '-left-2 sm:-left-1.5'} w-7 h-7 sm:w-5 sm:h-5 rounded-full bg-gray-800/50 flex items-center justify-center
                         opacity-50 sm:opacity-0 sm:group-hover:opacity-60 hover:!opacity-100 hover:!bg-gray-800/80
                         transition-all duration-150 z-10 cursor-pointer`}
              aria-label="Minimize widget"
            >
              <X className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-white" strokeWidth={2.5} />
            </div>
          )}

          {/* Content Container */}
          <div className="relative flex items-center justify-center h-full px-4 gap-2">
            {/* Message Icon */}
            <div className="flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-gray-900" />
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-start overflow-hidden whitespace-nowrap gap-1">
              <span className="text-sm font-semibold text-gray-900 leading-tight text-left">
                {line1 || DEFAULT_LINE1}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-800 leading-tight text-left">
                {line2 || DEFAULT_LINE2}
              </span>
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
