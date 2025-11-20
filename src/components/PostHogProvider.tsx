'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

      console.log('PostHog init attempt:', { key: key ? 'present' : 'missing', host })

      if (!key || !host) {
        console.warn('PostHog environment variables not configured')
        return
      }

      console.log('Initializing PostHog...')

      try {
        posthog.init(key, {
          api_host: host,
          person_profiles: 'identified_only', // Only create profiles for logged-in users
          capture_pageview: false, // We'll manually track page views for better control
          capture_pageleave: true, // Track when users leave pages
          autocapture: false, // Disable to avoid capturing sensitive form data
          session_recording: {
            maskAllInputs: true, // Mask all input fields in session replay
            maskTextSelector: '[data-sensitive]' // Additionally mask elements with data-sensitive attribute
          },
          // Enable session replay with privacy settings
          enable_recording_console_log: false, // Don't record console logs (may contain sensitive data)
          disable_session_recording: false, // Enable session recording (as requested)
          loaded: (posthog) => {
            console.log('PostHog loaded successfully')
          },
          on_xhr_error: (error) => {
            console.error('PostHog XHR error:', error)
          }
        })
        console.log('PostHog init called successfully')
      } catch (error) {
        console.error('PostHog init error:', error)
      }
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
