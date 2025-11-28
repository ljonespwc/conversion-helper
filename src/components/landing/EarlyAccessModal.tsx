'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface EarlyAccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EarlyAccessModal({ isOpen, onClose }: EarlyAccessModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Ensure we're on client for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on escape key
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

  // Reset state when modal opens
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
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError("You're already on the list!")
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
        aria-labelledby="modal-title"
      >
        {/* Close button */}
        <button
          className="early-access-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {submitted ? (
          /* Success state */
          <div className="early-access-success">
            <div className="early-access-success-icon">🎉</div>
            <h2 id="modal-title" className="early-access-title">You're in!</h2>
            <p className="early-access-description">
              Check your inbox for a confirmation. We'll reach out soon with your early access details.
            </p>
            <button
              className="early-access-button-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          /* Form state */
          <>
            <h2 id="modal-title" className="early-access-title">Get Early Access</h2>
            <p className="early-access-description">
              Be among the first to make your website voice-powered.
            </p>

            <ul className="early-access-perks">
              <li>🎁 <strong>Free for 30 days:</strong> One page, full features, no card required</li>
              <li>💬 <strong>Direct founder access:</strong> Shape the product with your feedback</li>
              <li>⚡ <strong>Priority onboarding:</strong> We'll help you get set up</li>
            </ul>

            <form onSubmit={handleSubmit} className="early-access-form">
              <div className="early-access-field">
                <label htmlFor="early-access-email" className="early-access-label">
                  Email address
                </label>
                <input
                  id="early-access-email"
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
                {isSubmitting ? 'Joining...' : 'Claim My Spot'}
              </button>
            </form>

            <p className="early-access-note">
              Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
