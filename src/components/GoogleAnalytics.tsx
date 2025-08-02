'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function GoogleAnalytics() {
  const [mounted, setMounted] = useState(false)
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}

// Event tracking functions
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Custom events for Edirne Events
export const trackEventView = (eventId: number, eventTitle: string) => {
  trackEvent('view_event', 'engagement', `Event: ${eventTitle}`, eventId)
}

export const trackVenueView = (venueId: number, venueName: string) => {
  trackEvent('view_venue', 'engagement', `Venue: ${venueName}`, venueId)
}

export const trackEventSubmission = (eventTitle: string) => {
  trackEvent('submit_event', 'user_action', `Event: ${eventTitle}`)
}

export const trackVenueSubmission = (venueName: string) => {
  trackEvent('submit_venue', 'user_action', `Venue: ${venueName}`)
}

export const trackSearch = (query: string) => {
  trackEvent('search', 'user_action', `Query: ${query}`)
}

export const trackSocialShare = (platform: string, content: string) => {
  trackEvent('social_share', 'engagement', `${platform}: ${content}`)
}

// Extend window object for TypeScript
declare global {
  interface Window {
    gtag: any
  }
}