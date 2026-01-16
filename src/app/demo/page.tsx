'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamicImport from 'next/dynamic'

// Dynamically import VoiceWidget with no SSR (client-only component)
const VoiceWidget = dynamicImport(() => import('@/components/widget/VoiceWidget'), {
  ssr: false,
  loading: () => <div className="text-white text-sm">Loading widget...</div>
})

// Disable static generation for this page (contains dynamic params and client-only code)
export const dynamic = 'force-dynamic'

// Whitelist of allowed domains for demo
const ALLOWED_DOMAINS = [
  'precisionnutrition.com',
  'pilot.com'
]

// API keys by domain (Precision Nutrition has its own org)
const API_KEYS: Record<string, string> = {
  'precisionnutrition.com': 'pk_live_ae8fe97e62e6f7dd97cb651b5a3ce9ac84482bfcf14f7a3c',
  'default': 'pk_live_77d79847449d815d284ec68564a121d5c39362637819eaab'
}

export default function DemoPage() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const [error, setError] = useState<string | null>(null)
  const [validatedUrl, setValidatedUrl] = useState<string | null>(null)
  const [actualPageUrl, setActualPageUrl] = useState<string | null>(null)
  const [domainName, setDomainName] = useState<string>('')

  useEffect(() => {
    // Validate URL
    if (!url) {
      setError('No URL provided. Add ?url=https://example.com/your-page')
      return
    }

    try {
      const parsedUrl = new URL(url)

      // Allow our own proxy endpoint OR whitelisted domains
      const isProxyUrl = parsedUrl.hostname.includes('easyask.io') && parsedUrl.pathname === '/api/proxy-demo'
      const isAllowedDomain = ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.includes(domain))

      if (!isProxyUrl && !isAllowedDomain) {
        setError(`Only ${ALLOWED_DOMAINS.join(', ')} URLs are allowed`)
        return
      }

      // Extract domain name for display and actual page URL for widget
      if (isProxyUrl) {
        // For proxy URLs, extract the actual target URL from query params
        const targetUrl = parsedUrl.searchParams.get('url')
        if (targetUrl) {
          try {
            const targetParsed = new URL(targetUrl)
            setDomainName(targetParsed.hostname)
            setActualPageUrl(targetUrl) // Pass the actual URL to the widget
          } catch {
            setDomainName('Proxied Page')
            setActualPageUrl(null)
          }
        } else {
          setDomainName('Proxied Page')
          setActualPageUrl(null)
        }
      } else {
        const matchedDomain = ALLOWED_DOMAINS.find(domain => parsedUrl.hostname.includes(domain))
        setDomainName(matchedDomain || '')
        setActualPageUrl(url) // Direct URL - use as-is
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
              /demo?url=https://www.precisionnutrition.com/nutrition-certification-level-1-register-now
            </code>
            <p className="text-sm text-gray-400 mt-4">Allowed domains:</p>
            <ul className="text-blue-400 text-sm mt-2 space-y-1">
              {ALLOWED_DOMAINS.map(domain => (
                <li key={domain}>• {domain}</li>
              ))}
            </ul>
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
      {/* Target page in iframe */}
      <iframe
        src={validatedUrl}
        className="absolute inset-0 w-full h-full border-0 bg-white"
        title={`${domainName} Demo`}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-clipboard-read allow-clipboard-write"
        allow="autoplay *"
      />

      {/* Widget overlay - positioned absolutely on top */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <style jsx global>{`
            /* Override widget button position for demo page only */
            .demo-widget-container button[aria-label="Open chat assistant"] {
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
          `}</style>
          <div className="demo-widget-container">
            <VoiceWidget
              pageUrl={actualPageUrl || validatedUrl}
              embedded={true}
              isDemo={true}
              apiKey={API_KEYS[domainName] || API_KEYS['default']}
            />
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
