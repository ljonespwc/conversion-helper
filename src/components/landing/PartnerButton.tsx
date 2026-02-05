'use client'

import { useState } from 'react'
import { PartnerModal } from './PartnerModal'

interface PartnerButtonProps {
  children: React.ReactNode
  className?: string
}

export function PartnerButton({ children, className = '' }: PartnerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        {children}
      </button>
      <PartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
