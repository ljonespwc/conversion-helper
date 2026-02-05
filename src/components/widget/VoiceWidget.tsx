'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WidgetModal from './WidgetModal'
import WidgetButton from './WidgetButton'
import { usePostHog } from 'posthog-js/react'

interface VoiceWidgetProps {
  isOpen?: boolean
  onClose?: () => void
  embedded?: boolean
  pageUrl?: string
  position?: 'bottom-left' | 'bottom-right'
  timezone?: string
  isDemo?: boolean
  apiKey?: string
  groupId?: string
  viewportWidth?: number
  initialCollapsed?: boolean
  visitorId?: string
  forceActive?: boolean
}

export default function VoiceWidget({ isOpen = false, onClose, embedded = false, pageUrl, position = 'bottom-right', timezone, isDemo = false, apiKey, groupId, viewportWidth = 0, initialCollapsed = false, visitorId, forceActive = false }: VoiceWidgetProps) {
  const posthog = usePostHog()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isWidened, setIsWidened] = useState(false)
  const [pageTitle, setPageTitle] = useState<string | undefined>(undefined)
  const [organizationName, setOrganizationName] = useState<string | undefined>(undefined)
  const [isActive, setIsActive] = useState<boolean | null>(null)
  const [showBranding, setShowBranding] = useState<boolean>(true)
  const [widgetLine1, setWidgetLine1] = useState<string | undefined>(undefined)
  const [widgetLine2, setWidgetLine2] = useState<string | undefined>(undefined)
  const [isExperimental, setIsExperimental] = useState<boolean>(false)
  const [resolvedPosition, setResolvedPosition] = useState<'bottom-left' | 'bottom-right'>(position)
  const [pageGoal, setPageGoal] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(initialCollapsed)
  const hasEverBeenActive = useRef(false)

  const isModalOpen = embedded ? internalOpen : isOpen
  const handleClose = embedded ? () => {
    // Send resize message BEFORE state change so iframe shrinks before modal unmounts
    if (typeof (window as any).onWidgetStateChange === 'function') {
      (window as any).onWidgetStateChange(false, { experimental: isExperimental })
    }
    setInternalOpen(false)
    setIsWidened(false)
  } : onClose || (() => {})

  // Fetch page config when pageUrl changes
  useEffect(() => {
    if (pageUrl && embedded) {
      // On initial load: reset state and wait for API response
      // On SPA URL change when previously active: keep pill visible, re-check in background
      if (!hasEverBeenActive.current) {
        setIsActive(null)
        setPageTitle(undefined)
        setOrganizationName(undefined)
        setWidgetLine1(undefined)
        setWidgetLine2(undefined)
        setIsExperimental(false)
      }

      const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : ''
      const groupParam = groupId ? `&group_id=${encodeURIComponent(groupId)}` : ''
      fetch(`/api/widget-pages?url=${encodeURIComponent(pageUrl)}${keyParam}${groupParam}&_t=${Date.now()}`, {
        cache: 'no-store'
      })
        .then(res => res.json())
        .then(data => {
          if (data?.page?.page_title) {
            setPageTitle(data.page.page_title)
          }
          if (data?.page?.organization_name) {
            setOrganizationName(data.page.organization_name)
          }
          const pageIsActive = data?.page?.is_active === true
          setIsActive(pageIsActive)
          if (pageIsActive) {
            hasEverBeenActive.current = true
          }
          setShowBranding(data?.page?.show_branding ?? true)
          setWidgetLine1(data?.page?.widget_line1)
          setWidgetLine2(data?.page?.widget_line2)
          setIsExperimental(data?.page?.is_experimental ?? false)
          // Update position from API (overrides data-position attribute)
          const apiPosition = data?.page?.widget_position
          if (apiPosition === 'bottom-left' || apiPosition === 'bottom-right') {
            setResolvedPosition(apiPosition)
          }
          setPageGoal(data?.page?.page_goal ?? null)
          if (window.parent !== window) {
            // Send position to parent iframe BEFORE showing, so it repositions while still hidden
            if (apiPosition === 'bottom-left' || apiPosition === 'bottom-right') {
              window.parent.postMessage({ type: 'easyask:position', position: apiPosition }, '*')
            }
            window.parent.postMessage({ type: pageIsActive ? 'easyask:show' : 'easyask:hide' }, '*')
          }
        })
        .catch(err => {
          console.error('Failed to fetch page info:', err)
          setIsActive(false)
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'easyask:hide' }, '*')
          }
        })
    }
  }, [pageUrl, embedded, apiKey, groupId])

  const handleCollapse = () => {
    setIsCollapsed(true)
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'easyask:collapse', collapsed: true }, '*')
    }
  }

  const handleToggleWidth = () => {
    const newWidened = !isWidened
    setIsWidened(newWidened)
    if (typeof (window as any).onWidgetStateChange === 'function') {
      (window as any).onWidgetStateChange(true, { widened: newWidened, experimental: isExperimental })
    }
  }

  // Don't render widget until we confirm page is active (unless forceActive is set for testing)
  if (!isActive && !forceActive) {
    return null
  }

  return (
    <>
      {embedded && !isModalOpen && (
        <WidgetButton
          onClick={() => {
            // Send resize message BEFORE state change so iframe expands before modal renders
            if (typeof (window as any).onWidgetStateChange === 'function') {
              (window as any).onWidgetStateChange(true, { experimental: isExperimental })
            }
            setInternalOpen(true)
            // Track widget opened
            posthog?.capture('widget_opened', {
              page_url: pageUrl,
              page_title: pageTitle,
              organization_name: organizationName
            })
            // Track open in Supabase (fire-and-forget)
            if (apiKey && pageUrl) {
              fetch('/api/widget-open', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: apiKey, page_url: pageUrl, visitor_id: visitorId, group_id: groupId })
              }).catch(() => {})
            }
          }}
          onCollapse={handleCollapse}
          isCollapsed={isCollapsed}
          pageUrl={pageUrl}
          pageTitle={pageTitle}
          position={resolvedPosition}
          line1={widgetLine1}
          line2={widgetLine2}
        />
      )}

      <AnimatePresence>
        {isModalOpen && (
          <WidgetModal
            onClose={handleClose}
            pageUrl={pageUrl}
            organizationName={organizationName}
            showBranding={showBranding}
            timezone={timezone}
            isDemo={isDemo}
            apiKey={apiKey}
            isExperimental={isExperimental}
            groupId={groupId}
            position={resolvedPosition}
            isWidened={isWidened}
            onToggleWidth={handleToggleWidth}
            viewportWidth={viewportWidth}
            visitorId={visitorId}
            pageGoal={pageGoal}
          />
        )}
      </AnimatePresence>
    </>
  )
}