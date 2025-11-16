'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface WidgetButtonProps {
  onClick: () => void
  pageUrl?: string
  pageTitle?: string
}

export default function WidgetButton({ onClick, pageUrl, pageTitle }: WidgetButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isTapped, setIsTapped] = useState(false)

  // Determine if we should show expanded state
  const isExpanded = isHovered || isTapped

  // Static text for button
  const getButtonText = () => {
    return "Got questions? Save time and ask!"
  }

  const handleClick = () => {
    onClick()
  }

  const handleTap = () => {
    if (!isTapped) {
      setIsTapped(true)
      // Auto-close tap expansion after 3 seconds
      setTimeout(() => setIsTapped(false), 3000)
    } else {
      setIsTapped(false)
    }
  }

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTap}
      className="group fixed bottom-6 right-6 z-40 shadow-xl"
      aria-label="Open voice assistant"
      style={{
        width: isExpanded ? 'auto' : '60px',
        minWidth: isExpanded ? '200px' : '60px',
        maxWidth: isExpanded ? '340px' : '60px',
        height: '60px',
        borderRadius: isExpanded ? '30px' : '50%',
        transition: 'all 0.3s ease-out'
      }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full group-hover:rounded-[30px] transition-all duration-300"
           style={{ borderRadius: isExpanded ? '30px' : '50%' }} />

      {/* Animated Sound Wave Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="sound-wave-ring sound-wave-ring-1" />
        <div className="sound-wave-ring sound-wave-ring-2" />
        <div className="sound-wave-ring sound-wave-ring-3" />
      </div>

      {/* Breathing Pulse Effect */}
      <motion.div
        className="absolute inset-0 bg-white rounded-full opacity-20"
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
                {getButtonText()}
              </span>
              <span className="text-xs text-blue-100 leading-tight">
                🎤 Voice-enabled • Instant answers
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSS for Sound Wave Rings */}
      <style jsx>{`
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

        @media (max-width: 640px) {
          .sound-wave-ring-1 {
            width: 50px;
            height: 50px;
          }
          .sound-wave-ring-2 {
            width: 50px;
            height: 50px;
          }
          .sound-wave-ring-3 {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </motion.button>
  )
}