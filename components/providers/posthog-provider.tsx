'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Suspense } from 'react'

// Ensure PostHog is only initialized once
let posthogInitialized = false

function initPostHog() {
  if (typeof window === 'undefined') return // Don't run on server side
  if (posthogInitialized) return // Don't initialize twice

  const apiKey = process.env['NEXT_PUBLIC_POSTHOG_KEY']
  if (!apiKey) {
    console.error('PostHog API key is missing')
    return
  }

  try {
    posthog.init(apiKey, {
      api_host: 'https://eu.i.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug()
        }
      },
      capture_pageview: false,
      persistence: 'memory', // Use memory instead of localStorage to avoid cookie warnings
      bootstrap: {}, // Empty bootstrap to avoid survey errors
      disable_session_recording: true,
      enable_recording_console_log: false,
      mask_all_text: true,
      mask_all_element_attributes: true,
      autocapture: {
        dom_event_allowlist: ['click'], // Only capture click events
      },
    })

    // Mark as initialized
    posthogInitialized = true

    if (process.env.NODE_ENV === 'development') {
      console.log('PostHog initialized successfully')
    }
  } catch (error) {
    console.error('PostHog initialization failed:', error)
    posthogInitialized = false
  }
}

function PostHogPageviewInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pageviewSent, setPageviewSent] = useState(false)

  useEffect(() => {
    // Initialize PostHog if not already initialized
    if (!posthogInitialized) {
      initPostHog()
    }

    // Only send pageview if PostHog is initialized and we haven't sent one for this page yet
    if (pathname && !pageviewSent && posthogInitialized) {
      try {
        const url = window.origin + pathname
        const queryString = searchParams?.toString()
        const fullUrl = queryString ? `${url}?${queryString}` : url

        posthog?.capture('$pageview', {
          $current_url: fullUrl,
          $pathname: pathname,
          distinct_id: posthog.get_distinct_id(),
        })

        setPageviewSent(true)

        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog pageview captured:', fullUrl)
        }
      } catch (error) {
        console.error('Failed to capture pageview:', error)
      }
    }
  }, [pathname, searchParams, pageviewSent])

  // Reset pageview flag when pathname changes
  useEffect(() => {
    setPageviewSent(false)
  }, [pathname])

  return null
}

export function PostHogPageview() {
  return (
    <Suspense fallback={null}>
      <PostHogPageviewInner />
    </Suspense>
  )
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog on mount
    if (!posthogInitialized) {
      initPostHog()
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
} 