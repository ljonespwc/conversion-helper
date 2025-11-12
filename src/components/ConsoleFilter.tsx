'use client'

import { useEffect } from 'react'

export function ConsoleFilter() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Store original console methods
    const originalLog = console.log
    const originalWarn = console.warn

    // Override console.log to filter Layercode debug messages
    console.log = (...args: any[]) => {
      const message = args[0]

      // Filter out Layercode SDK debug messages
      if (
        typeof message === 'string' &&
        (message.includes('msg:') ||
         message.includes('sent_msg:') ||
         message.includes('onSpeechStart:') ||
         message.includes('onSpeechEnd:') ||
         message.includes('[VAD]') ||
         message.includes('delta_counter'))
      ) {
        return // Skip these logs
      }

      // Filter out specific Layercode object logs
      if (
        typeof message === 'object' &&
        message !== null &&
        ('types' in message || 'turn_id' in message || 'event' in message)
      ) {
        return // Skip Layercode event objects
      }

      // Call original console.log for everything else
      originalLog.apply(console, args)
    }

    // Override console.warn to filter TensorFlow warnings
    console.warn = (...args: any[]) => {
      const message = String(args[0])

      // Filter out TensorFlow and ONNX warnings
      if (
        message.includes('CleanupUninitializedAndNodeArgs') ||
        message.includes('@tensorflow') ||
        message.includes('onnxruntime') ||
        message.includes('graph.cc')
      ) {
        return // Skip these warnings
      }

      // Call original console.warn for everything else
      originalWarn.apply(console, args)
    }

    // Cleanup: restore original console methods on unmount
    return () => {
      console.log = originalLog
      console.warn = originalWarn
    }
  }, [])

  return null // This component doesn't render anything
}
