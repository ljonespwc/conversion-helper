'use client'

import { useState, useEffect } from 'react'
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
}

export default function VoiceWidget({ isOpen = false, onClose, embedded = false, pageUrl, position = 'bottom-right', timezone, isDemo = false, apiKey }: VoiceWidgetProps) {
  const posthog = usePostHog()
  const [internalOpen, setInternalOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState<string | undefined>(undefined)
  const [organizationName, setOrganizationName] = useState<string | undefined>(undefined)
  const [isActive, setIsActive] = useState<boolean | null>(null)
  const [showBranding, setShowBranding] = useState<boolean>(true)
  const [widgetLine1, setWidgetLine1] = useState<string | undefined>(undefined)
  const [widgetLine2, setWidgetLine2] = useState<string | undefined>(undefined)
  const [isExperimental, setIsExperimental] = useState<boolean>(false)

  const isModalOpen = embedded ? internalOpen : isOpen
  const handleClose = embedded ? () => setInternalOpen(false) : onClose || (() => {})

  // Fetch page title and organization name if pageUrl is provided
  useEffect(() => {
    if (pageUrl && embedded) {
      // Reset state when pageUrl changes
      setIsActive(null)
      setPageTitle(undefined)
      setOrganizationName(undefined)
      setWidgetLine1(undefined)
      setWidgetLine2(undefined)
      setIsExperimental(false)

      // Try to fetch page info from widget pages API (with cache-busting)
      // Include API key for authorization
      const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : ''
      fetch(`/api/widget-pages?url=${encodeURIComponent(pageUrl)}${keyParam}&_t=${Date.now()}`, {
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
          // Check if widget is active on this page (only active if page exists AND is_active is true)
          const pageIsActive = data?.page?.is_active === true
          setIsActive(pageIsActive)
          // Set branding visibility from organization setting
          setShowBranding(data?.page?.show_branding ?? true)
          // Set widget button copy from organization settings
          setWidgetLine1(data?.page?.widget_line1)
          setWidgetLine2(data?.page?.widget_line2)
          // Set experimental mode flag
          setIsExperimental(data?.page?.is_experimental ?? false)
          // Notify parent iframe to show/hide widget
          if (window.parent !== window) {
            window.parent.postMessage({ type: pageIsActive ? 'easyask:show' : 'easyask:hide' }, '*')
          }
        })
        .catch(err => {
          console.error('Failed to fetch page info:', err)
          setIsActive(false) // Hide on error
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'easyask:hide' }, '*')
          }
        })
    }
  }, [pageUrl, embedded, apiKey])

  // Notify parent of modal state changes (for iframe resize)
  useEffect(() => {
    if (embedded && typeof (window as any).onWidgetStateChange === 'function') {
      (window as any).onWidgetStateChange(internalOpen, isExperimental)
    }
  }, [internalOpen, embedded, isExperimental])


  // Don't render widget until we confirm page is active
  if (!isActive) {
    return null
  }

  return (
    <>
      {embedded && !isModalOpen && (
        <WidgetButton
          onClick={() => {
            setInternalOpen(true)
            // Track widget opened
            posthog?.capture('widget_opened', {
              page_url: pageUrl,
              page_title: pageTitle,
              organization_name: organizationName
            })
          }}
          pageUrl={pageUrl}
          pageTitle={pageTitle}
          position={position}
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
          />
        )}
      </AnimatePresence>
    </>
  )
}