'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import to prevent SSR issues
const VoiceWidget = dynamic(() => import('@/components/widget/VoiceWidget'), {
  ssr: false
})

function WidgetContent() {
  const searchParams = useSearchParams()
  const pageUrl = searchParams.get('url')

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
    ;(window as any).onWidgetStateChange = (expanded: boolean) => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'easyask:resize', expanded }, '*')
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
      <VoiceWidget embedded={true} pageUrl={pageUrl || undefined} />
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
