import type { PostHog } from 'posthog-js'
import type { MessageId } from './content'

// Without a key (e.g. local dev or PR previews) nothing is sent and the site works the same.
const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com'

const ATTRIBUTION_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'origin'] as const
const attribution: Record<string, string> = {}

// PostHog loads after the page so it doesn't slow down people on mobile data.
let loading: Promise<PostHog | null> = Promise.resolve(null)

/** The two screens; the same values name the screen in the router and the `page` in events. */
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

export type FaqId = 'is-it-free' | 'regular-whatsapp' | 'single-apartment' | 'tech-skills' | 'who-is-behind-lia'

type NoProps = Record<string, never>

/** Every custom event and its exact properties (documented in the README). */
export type EventProps = {
  /** went from home to the messages screen; `message` is null for the list itself */
  opened_messages: { from: 'home'; message: MessageId | null }
  copied_message: { message: MessageId; page: Page }
  /** the browser blocked the copy */
  copy_failed: { message: MessageId; page: Page }
  downloaded_pdf: { page: Page }
  /** went to the Tally form */
  clicked_waitlist: { page: Page }
  opened_faq: { question: FaqId }
  clicked_linkedin: NoProps
}

export type AnalyticsEvent = keyof EventProps

export function track<Event extends AnalyticsEvent>(
  event: Event,
  ...[props]: EventProps[Event] extends NoProps ? [] : [props: EventProps[Event]]
) {
  void loading.then((ph) => ph?.capture(event, props ?? {}))
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
