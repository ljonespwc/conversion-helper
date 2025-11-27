'use client'

import { useState } from 'react'
import { EarlyAccessModal } from './EarlyAccessModal'

interface EarlyAccessButtonProps {
  children: React.ReactNode
  className?: string
}

export function EarlyAccessButton({ children, className = '' }: EarlyAccessButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        {children}
      </button>
      <EarlyAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
