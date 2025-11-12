'use client'

import { useState } from 'react'
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

  const isModalOpen = embedded ? internalOpen : isOpen
  const handleClose = embedded ? () => setInternalOpen(false) : onClose || (() => {})

  return (
    <>
      {embedded && (
        <WidgetButton onClick={() => setInternalOpen(true)} />
      )}

      <AnimatePresence>
        {isModalOpen && (
          <WidgetModal onClose={handleClose} pageUrl={pageUrl} />
        )}
      </AnimatePresence>
    </>
  )
}