'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

/**
 * Demo version of the widget button for the landing page.
 * Shows all animations (pulsing, hover effects) but doesn't launch anything.
 * Always displays in pill form.
 */
export default function WidgetButtonDemo() {
  const [showSparkleBurst, setShowSparkleBurst] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    // Trigger sparkle burst on click
    setShowSparkleBurst(true)
    setTimeout(() => setShowSparkleBurst(false), 800)
  }

  return (
    <div className="widget-button-demo-container">
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        onClick={handleClick}
        className="group relative shadow-xl cursor-pointer"
        aria-label="Widget demo"
        style={{
          width: 'auto',
          minWidth: '200px',
          maxWidth: '340px',
          height: '60px',
          borderRadius: '30px',
          border: 'none',
          outline: 'none',
          background: 'transparent'
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

        {/* Sparkle Burst Animation on Click */}
        <AnimatePresence>
          {showSparkleBurst && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1.5],
                    opacity: [1, 0],
                    x: Math.cos((i * Math.PI * 2) / 8) * 60,
                    y: Math.sin((i * Math.PI * 2) / 8) * 60
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut"
                  }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

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
          <div className="flex flex-col items-start overflow-hidden whitespace-nowrap">
            <span className="text-sm font-semibold text-white leading-tight">
              Don't feel like reading? Just ask!
            </span>
            <span className="text-xs text-blue-100 leading-tight">
              💬 Instant answers • Always helpful
            </span>
          </div>
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
