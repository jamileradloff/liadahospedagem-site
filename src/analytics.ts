import type { PostHog } from 'posthog-js'

// Without a key (e.g. local dev or PR previews) nothing is sent and the site works the same.
const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com'

const ATTRIBUTION_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'origin'] as const
const attribution: Record<string, string> = {}

// PostHog loads after the page so it doesn't slow down people on mobile data.
let loading: Promise<PostHog | null> = Promise.resolve(null)

export type Page = 'home' | 'messages'

export function initAnalytics() {
  // Remember where the visitor came from (e.g. which Reel), to attach to every event and to the Tally link.
  const params = new URLSearchParams(window.location.search)
  for (const name of ATTRIBUTION_PARAMS) {
    const value = params.get(name)
    if (value) attribution[name] = value
  }

  if (!KEY) return
  loading = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(KEY, {
        api_host: HOST,
        persistence: 'memory', // no cookies, no localStorage: no consent banner needed
        autocapture: false, // only the events below, no noise
        capture_pageview: false, // two screens in one page; screen views are tracked manually
        capture_pageleave: true,
        person_profiles: 'identified_only',
      })
      if (Object.keys(attribution).length) posthog.register(attribution)
      return posthog
    })
    .catch(() => null) // ad blockers etc.: the site keeps working
}

export type AnalyticsEvent =
  | 'opened_messages' // { from, anchor } went to the copy screen
  | 'copied_message' // { message, page }
  | 'copy_failed' // { message, page } the browser blocked the copy
  | 'downloaded_pdf' // { page }
  | 'clicked_waitlist' // { page } went to the Tally form
  | 'opened_faq' // { question }
  | 'clicked_linkedin'

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  void loading.then((ph) => ph?.capture(event, props))
}

export function trackPageview() {
  void loading.then((ph) => ph?.capture('$pageview'))
}

/** Tally link carrying the origin, to match each answer to the page and the Reel.
 *  The Tally form needs hidden fields named "origin" and "reel". */
export function waitlistUrl(base: string, page: Page) {
  const url = new URL(base)
  const fromPdf = attribution.origin === 'pdf' || attribution.utm_source === 'pdf'
  url.searchParams.set('origin', fromPdf ? 'pdf' : page)
  if (attribution.utm_content) url.searchParams.set('reel', attribution.utm_content)
  return url.toString()
}
