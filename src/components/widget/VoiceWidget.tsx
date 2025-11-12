'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WidgetModal from './WidgetModal'
import WidgetButton from './WidgetButton'

interface VoiceWidgetProps {
  isOpen?: boolean
  onClose?: () => void
  embedded?: boolean
  testPageUrl?: string
  deploymentId?: string
}

export default function VoiceWidget({ isOpen = false, onClose, embedded = false, testPageUrl, deploymentId }: VoiceWidgetProps) {
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
          <WidgetModal onClose={handleClose} testPageUrl={testPageUrl} deploymentId={deploymentId} />
        )}
      </AnimatePresence>
    </>
  )
}