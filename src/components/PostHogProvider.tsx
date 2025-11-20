'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

      if (!key || !host) {
        return
      }

      posthog.init(key, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: false,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '[data-sensitive]'
        },
        enable_recording_console_log: false,
        disable_session_recording: false,
      })
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
