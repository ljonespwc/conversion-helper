'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamicImport from 'next/dynamic'

// Dynamically import VoiceWidget with no SSR (client-only)
const VoiceWidget = dynamicImport(() => import('@/components/widget/VoiceWidget'), {
  ssr: false,
  loading: () => <div className="text-white text-sm">Loading widget...</div>
})

// Disable static generation for this page (contains dynamic params and client-only code)
export const dynamic = 'force-dynamic'

export default function PNDemoPage() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const [error, setError] = useState<string | null>(null)
  const [validatedUrl, setValidatedUrl] = useState<string | null>(null)

  useEffect(() => {
    // Validate URL
    if (!url) {
      setError('No URL provided. Add ?url=https://www.precisionnutrition.com/your-page')
      return
    }

    try {
      const parsedUrl = new URL(url)

      // Only allow precisionnutrition.com URLs
      if (!parsedUrl.hostname.includes('precisionnutrition.com')) {
        setError('Only precisionnutrition.com URLs are allowed')
        return
      }

      setValidatedUrl(url)
      setError(null)
    } catch (e) {
      setError('Invalid URL format')
    }
  }, [url])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">Demo Configuration Error</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Example usage:</p>
            <code className="text-blue-400 text-sm break-all">
              /demo/pn?url=https://www.precisionnutrition.com/nutrition-certification-level-1-register-now
            </code>
          </div>
        </div>
      </div>
    )
  }

  if (!validatedUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* PN Page in iframe */}
      <iframe
        src={validatedUrl}
        className="absolute inset-0 w-full h-full border-0 bg-white"
        title="Precision Nutrition Page"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        allow="microphone *; autoplay *"
      />

      {/* Widget overlay - positioned absolutely on top */}
      {/* Move widget to bottom-left to avoid PN's help button on bottom-right */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <style jsx global>{`
            /* Override widget button position for demo page only */
            .demo-widget-container button[aria-label="Open voice assistant"] {
              right: auto !important;
              left: 1.5rem !important;
            }

            /* Remove backdrop blur to allow page scrolling */
            .demo-widget-container .fixed.inset-0 > div.absolute.inset-0 {
              background: transparent !important;
              backdrop-filter: none !important;
              pointer-events: none !important;
            }

            /* Keep modal container clickable but transparent background */
            .demo-widget-container .fixed.inset-0 {
              background: transparent !important;
              pointer-events: none !important;
            }

            /* Make the modal card itself interactable */
            .demo-widget-container .fixed.inset-0 > div:last-child {
              pointer-events: auto !important;
            }

            /* Shrink voice button (speaker orb) by 50% */
            .demo-widget-container button[class*="rounded-full"][class*="gradient"] {
              padding: 1rem !important; /* Was 2rem (p-8), now 1rem = 50% smaller */
            }
          `}</style>
          <div className="demo-widget-container">
            <VoiceWidget pageUrl={validatedUrl} embedded={true} />
          </div>
        </div>
      </div>

      {/* Demo indicator badge */}
      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg z-50 pointer-events-none">
        🎬 Demo Mode
      </div>
    </div>
  )
}
