'use client'

import { useEffect } from 'react'
import VoiceWidget from '@/components/widget/VoiceWidget'

export default function TestPage() {
  // Override window.location.href for testing purposes
  // This simulates being on the Precision Nutrition page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Store original href
      const originalHref = window.location.href;

      // Override for testing
      Object.defineProperty(window.location, 'href', {
        writable: true,
        value: 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now'
      });

      return () => {
        // Restore original (cleanup)
        Object.defineProperty(window.location, 'href', {
          writable: true,
          value: originalHref
        });
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Blank white page with widget */}
      <p className="text-gray-400 text-sm">Testing widget against indexed PN page</p>
      <VoiceWidget />
    </div>
  )
}
