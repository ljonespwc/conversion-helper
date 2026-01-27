'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import to prevent SSR issues
const VoiceWidget = dynamic(() => import('@/components/widget/VoiceWidget'), {
  ssr: false
})

function WidgetContent() {
  const searchParams = useSearchParams()
  const [pageUrl, setPageUrl] = useState<string | undefined>(searchParams.get('url') || undefined)
  const positionParam = searchParams.get('position')
  const position: 'bottom-left' | 'bottom-right' = positionParam === 'bottom-left' ? 'bottom-left' : 'bottom-right'
  const timezone = searchParams.get('tz') || undefined
  const apiKey = searchParams.get('key') || undefined
  const groupId = searchParams.get('group_id') || undefined
  const initialCollapsed = searchParams.get('collapsed') === '1'
  const [viewportWidth, setViewportWidth] = useState<number>(Number(searchParams.get('vw')) || 0)

  // Listen for messages from parent (SPA navigation + viewport width updates)
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'easyask:urlchange' && typeof e.data.url === 'string') {
        setPageUrl(e.data.url)
      }
      if (e.data?.type === 'easyask:vw' && typeof e.data.vw === 'number') {
        setViewportWidth(e.data.vw)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    // Inject style tag to force transparent background (overrides Tailwind's bg-background)
    const style = document.createElement('style')
    style.id = 'widget-transparent-bg'
    style.textContent = `
      html, body {
        background: transparent !important;
        background-color: transparent !important;
      }
    `
    document.head.appendChild(style)

    // Set up callback for widget state changes
    ;(window as any).onWidgetStateChange = (expanded: boolean, options?: { widened?: boolean; experimental?: boolean }) => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'easyask:resize', expanded, widened: options?.widened, experimental: options?.experimental }, '*')
      }
    }

    return () => {
      delete (window as any).onWidgetStateChange
      const existingStyle = document.getElementById('widget-transparent-bg')
      if (existingStyle) existingStyle.remove()
    }
  }, [])

  return (
    <div className="w-full h-screen bg-transparent">
      <VoiceWidget embedded={true} pageUrl={pageUrl} position={position} timezone={timezone} apiKey={apiKey} groupId={groupId} viewportWidth={viewportWidth} initialCollapsed={initialCollapsed} />
    </div>
  )
}

export default function WidgetPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-transparent" />}>
      <WidgetContent />
    </Suspense>
  )
}
