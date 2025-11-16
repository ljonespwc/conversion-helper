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
  const [internalOpen, setInternalOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState<string | undefined>(undefined)

  const isModalOpen = embedded ? internalOpen : isOpen
  const handleClose = embedded ? () => setInternalOpen(false) : onClose || (() => {})

  // Fetch page title if pageUrl is provided
  useEffect(() => {
    if (pageUrl && embedded) {
      // Try to fetch page title from widget pages API
      fetch(`/api/widget-pages?url=${encodeURIComponent(pageUrl)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.page?.page_title) {
            setPageTitle(data.page.page_title)
          }
        })
        .catch(err => {
          console.error('Failed to fetch page title:', err)
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
          />
        )}
      </AnimatePresence>
    </>
  )
}