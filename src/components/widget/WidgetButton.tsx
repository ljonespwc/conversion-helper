'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface WidgetButtonProps {
  onClick: () => void
  pageUrl?: string
  pageTitle?: string
  position?: 'bottom-left' | 'bottom-right'
}

export default function WidgetButton({ onClick, position = 'bottom-right' }: WidgetButtonProps) {
  const isLeft = position === 'bottom-left'
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className={`group fixed bottom-4 ${isLeft ? 'left-4' : 'right-4'} z-40 shadow-xl h-[60px]`}
      aria-label="Open voice assistant"
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
        style={{ borderRadius: '30px' }}
      />

      {/* Content Container */}
      <div className="relative flex items-center justify-center h-full px-4 gap-2">
        {/* Sparkle Icon */}
        <div className="flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center overflow-hidden whitespace-nowrap gap-1">
          <span className="text-sm font-semibold text-white leading-tight text-center">
            Got questions about the program? Just ask!
          </span>
          <span className="text-xs text-blue-100 leading-tight text-center">
            🎤 Try PN's new AI voice assistant ✨
          </span>
        </div>
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
      `}</style>
    </motion.button>
  )
}
