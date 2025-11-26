'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

/**
 * Demo version of the widget button for the landing page.
 * Shows all animations (pulsing, hover expansion) but doesn't launch anything.
 */
export default function WidgetButtonDemo() {
  const [isHovered, setIsHovered] = useState(false)
  const [isTapped, setIsTapped] = useState(false)
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Determine if we should show expanded state
  const isExpanded = isHovered || isTapped

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
      }
    }
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    // On mobile (touch devices), toggle expanded state
    const isTouchDevice = 'ontouchstart' in window

    if (isTouchDevice) {
      // Clear any existing timeout
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
      }

      if (!isTapped) {
        setIsTapped(true)
        // Auto-close tap expansion after 4 seconds
        collapseTimeoutRef.current = setTimeout(() => {
          setIsTapped(false)
          collapseTimeoutRef.current = null
        }, 4000)
      } else {
        setIsTapped(false)
      }
    }
    // On desktop, hover handles expansion - click does nothing
  }

  return (
    <div className="widget-button-demo-container">
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative shadow-xl cursor-pointer"
        aria-label="Widget demo"
        style={{
          width: isExpanded ? 'auto' : '60px',
          minWidth: isExpanded ? '200px' : '60px',
          maxWidth: isExpanded ? '340px' : '60px',
          height: '60px',
          borderRadius: isExpanded ? '30px' : '50%',
          transition: 'all 0.3s ease-out',
          border: 'none',
          outline: 'none',
          background: 'transparent'
        }}
      >
        {/* Gradient Background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 transition-all duration-300"
          style={{ borderRadius: isExpanded ? '30px' : '50%' }}
        />

        {/* Animated Sound Wave Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="sound-wave-ring sound-wave-ring-1" />
          <div className="sound-wave-ring sound-wave-ring-2" />
          <div className="sound-wave-ring sound-wave-ring-3" />
        </div>

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
          style={{ borderRadius: isExpanded ? '30px' : '50%' }}
        />

        {/* Content Container */}
        <div className="relative flex items-center justify-center h-full px-4 gap-2">
          {/* Sparkle Icon */}
          <motion.div
            animate={{
              rotate: isExpanded ? 0 : [0, -10, 10, -10, 0],
            }}
            transition={{
              rotate: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1
              }
            }}
            className="flex-shrink-0"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>

          {/* Text Content (shows on hover/tap) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex flex-col items-start overflow-hidden whitespace-nowrap"
              >
                <span className="text-sm font-semibold text-white leading-tight">
                  Don't feel like reading? Just ask!
                </span>
                <span className="text-xs text-blue-100 leading-tight">
                  🎤 Voice answers • Instant help
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* CSS for Sound Wave Rings */}
      <style jsx>{`
        .widget-button-demo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 1rem 1rem 1rem;
        }

        .sound-wave-ring {
          position: absolute;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: soundWavePulse 2s ease-out infinite;
        }

        .sound-wave-ring-1 {
          width: 60px;
          height: 60px;
          animation-delay: 0s;
        }

        .sound-wave-ring-2 {
          width: 60px;
          height: 60px;
          animation-delay: 0.4s;
        }

        .sound-wave-ring-3 {
          width: 60px;
          height: 60px;
          animation-delay: 0.8s;
        }

        .group:hover .sound-wave-ring {
          animation: soundWavePulseFast 1s ease-out infinite;
        }

        @keyframes soundWavePulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        @keyframes soundWavePulseFast {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
