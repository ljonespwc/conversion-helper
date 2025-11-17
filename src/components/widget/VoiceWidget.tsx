'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WidgetModal from './WidgetModal'
import WidgetButton from './WidgetButton'

interface VoiceWidgetProps {
  isOpen?: boolean
  onClose?: () => void
  embedded?: boolean
  pageUrl?: string
}

export default function VoiceWidget({ isOpen = false, onClose, embedded = false, pageUrl }: VoiceWidgetProps) {
  console.log('🔵 VoiceWidget RENDER', { isOpen, embedded, internalOpen: '(initializing)' })

  const [internalOpen, setInternalOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState<string | undefined>(undefined)
  const [organizationName, setOrganizationName] = useState<string | undefined>(undefined)

  const isModalOpen = embedded ? internalOpen : isOpen
  const handleClose = embedded ? () => setInternalOpen(false) : onClose || (() => {})

  // Fetch page title and organization name if pageUrl is provided
  useEffect(() => {
    console.log('🟢 VoiceWidget MOUNTED')
    return () => {
      console.log('🔴 VoiceWidget UNMOUNTED')
    }
  }, [])

  useEffect(() => {
    if (pageUrl && embedded) {
      // Try to fetch page info from widget pages API
      fetch(`/api/widget-pages?url=${encodeURIComponent(pageUrl)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.page?.page_title) {
            setPageTitle(data.page.page_title)
          }
          if (data?.page?.organization_name) {
            setOrganizationName(data.page.organization_name)
          }
        })
        .catch(err => {
          console.error('Failed to fetch page info:', err)
        })
    }
  }, [pageUrl, embedded])

  return (
    <>
      {embedded && (
        <WidgetButton
          onClick={() => setInternalOpen(true)}
          pageUrl={pageUrl}
          pageTitle={pageTitle}
        />
      )}

      <AnimatePresence>
        {isModalOpen && (
          <WidgetModal
            onClose={handleClose}
            pageUrl={pageUrl}
            organizationName={organizationName}
          />
        )}
      </AnimatePresence>
    </>
  )
}