'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SubscribePage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const isSuccess = searchParams.get('success') === 'true'
  const isCanceled = searchParams.get('canceled') === 'true'
  const sessionId = searchParams.get('session_id')
  const orgId = searchParams.get('org')

  async function handleSubscribe() {
    if (!orgId) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      })
      const { url, error } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        alert(error || 'Something went wrong')
        setLoading(false)
      }
    } catch {
      alert('Something went wrong')
      setLoading(false)
    }
  }

  async function handleManageBilling() {
    if (!orgId) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      })
      const { url, error } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        alert(error || 'Something went wrong')
        setLoading(false)
      }
    } catch {
      alert('Something went wrong')
      setLoading(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Subscription active!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for subscribing to EasyAsk. Your account is now active.
          </p>
          {orgId && (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {loading ? 'Loading...' : 'Manage billing'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Canceled state
  if (isCanceled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Checkout canceled</h1>
          <p className="text-gray-600 mb-6">
            No worries — you can subscribe whenever you&apos;re ready.
          </p>
          {orgId && (
            <button
              onClick={handleSubscribe}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  // No org param
  if (!orgId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid link</h1>
          <p className="text-gray-600">This subscription link is missing required information.</p>
        </div>
      </div>
    )
  }

  // Default: checkout prompt
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">EasyAsk</h1>
        <p className="text-gray-500 text-sm mb-6">Conversational AI for your website</p>
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-3xl font-bold text-gray-900">$99<span className="text-base font-normal text-gray-500">/month</span></p>
        </div>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Redirecting to checkout...' : 'Subscribe'}
        </button>
        <p className="text-xs text-gray-400 mt-4">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  )
}
