'use client'

import { useEffect, useState } from 'react'
import dynamicImport from 'next/dynamic'

// Dynamically import VoiceWidget with no SSR (client-only)
const VoiceWidget = dynamicImport(() => import('@/components/widget/VoiceWidget'), {
  ssr: false,
  loading: () => null
})

// Disable static generation
export const dynamic = 'force-dynamic'

export default function WidgetEmbedPage() {
  const [pageUrl, setPageUrl] = useState<string>('')

  useEffect(() => {
    // Get the page URL from the parent window or query params
    const params = new URLSearchParams(window.location.search)
    const urlParam = params.get('url')

    if (urlParam) {
      setPageUrl(urlParam)
    } else if (window.opener || window.parent !== window) {
      // Try to get URL from parent/opener if in iframe or popup
      try {
        const parentUrl = window.opener?.location.href || window.parent.location.href
        if (parentUrl && parentUrl !== window.location.href) {
          setPageUrl(parentUrl)
        }
      } catch (e) {
        // Cross-origin restriction - use referrer or current page
        setPageUrl(document.referrer || window.location.href)
      }
    }
  }, [])

  if (!pageUrl) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 999999
    }}>
      <VoiceWidget pageUrl={pageUrl} embedded={true} />
    </div>
  )
}
