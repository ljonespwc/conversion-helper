'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface PartnerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PartnerModal({ isOpen, onClose }: PartnerModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setSubmitted(false)
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'partner' })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError("You've already applied!")
        } else {
          setError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="early-access-overlay" onClick={onClose}>
      <div
        className="early-access-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-modal-title"
      >
        <button
          className="early-access-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="early-access-success">
            <div className="early-access-success-icon">🤝</div>
            <h2 id="partner-modal-title" className="early-access-title">Application received!</h2>
            <p className="early-access-description">
              I&apos;ll review your application and get back to you shortly with your free account and referral link.
            </p>
            <button
              className="early-access-button-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 id="partner-modal-title" className="early-access-title">Apply to Partner Program</h2>
            <p className="early-access-description">
              Get your free Growth account and start earning 40% lifetime commissions.
            </p>

            <ul className="early-access-perks">
              <li>🎁 <strong>Free Growth plan:</strong> $299/mo value, yours at no cost</li>
              <li>💰 <strong>40% revenue share:</strong> Lifetime commissions on every referral</li>
              <li>🏷️ <strong>20% off for referrals:</strong> Easy sell — they save, you earn</li>
            </ul>

            <form onSubmit={handleSubmit} className="early-access-form">
              <div className="early-access-field">
                <label htmlFor="partner-email" className="early-access-label">
                  Email address
                </label>
                <input
                  id="partner-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="early-access-input"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {error && (
                <p className="early-access-error">{error}</p>
              )}

              <button
                type="submit"
                className="early-access-button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Apply Now'}
              </button>
            </form>

            <p className="early-access-note">
              No commitments. No quotas. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
