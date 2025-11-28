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
}

export default function VoiceWidget({ isOpen = false, onClose, embedded = false, pageUrl, position = 'bottom-right' }: VoiceWidgetProps) {
  const posthog = usePostHog()
  const [internalOpen, setInternalOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState<string | undefined>(undefined)
  const [organizationName, setOrganizationName] = useState<string | undefined>(undefined)
  const [isActive, setIsActive] = useState<boolean | null>(null)
  const [showBranding, setShowBranding] = useState<boolean>(true)

  const isModalOpen = embedded ? internalOpen : isOpen
  const handleClose = embedded ? () => setInternalOpen(false) : onClose || (() => {})

  // Fetch page title and organization name if pageUrl is provided
  useEffect(() => {
    if (pageUrl && embedded) {
      // Reset state when pageUrl changes
      setIsActive(null)
      setPageTitle(undefined)
      setOrganizationName(undefined)

      // Try to fetch page info from widget pages API (with cache-busting)
      fetch(`/api/widget-pages?url=${encodeURIComponent(pageUrl)}&_t=${Date.now()}`, {
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
          // Check if widget is active on this page
          setIsActive(data?.page?.is_active ?? true)
          // Set branding visibility from organization setting
          setShowBranding(data?.page?.show_branding ?? true)
        })
        .catch(err => {
          console.error('Failed to fetch page info:', err)
          setIsActive(true) // Default to active on error
        })
    }
  }, [pageUrl, embedded])

  // Notify parent of modal state changes (for iframe resize)
  useEffect(() => {
    if (embedded && typeof (window as any).onWidgetStateChange === 'function') {
      (window as any).onWidgetStateChange(internalOpen)
    }
  }, [internalOpen, embedded])

  // Hide widget if page not configured (send message to parent iframe)
  useEffect(() => {
    if (embedded && isActive === false && window.parent !== window) {
      window.parent.postMessage({ type: 'easyask:hide' }, '*')
    }
  }, [isActive, embedded])

  // Don't render widget if page is inactive
  if (isActive === false) {
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
        />
      )}

      <AnimatePresence>
        {isModalOpen && (
          <WidgetModal
            onClose={handleClose}
            pageUrl={pageUrl}
            organizationName={organizationName}
            showBranding={showBranding}
          />
        )}
      </AnimatePresence>
    </>
  )
}