import type { PostHog } from 'posthog-js'
import type { MessageId } from './content'

// Without a key (e.g. local dev or PR previews) nothing is sent and the site works the same.
const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com'

const ATTRIBUTION_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'origin', 'reel'] as const
const attribution: Record<string, string> = {}

// PostHog loads after the page so it doesn't slow down people on mobile data.
let loading: Promise<PostHog | null> = Promise.resolve(null)

/** The screens; the same values name the screen in the router and the `page` in events. */
export type Page = 'home' | 'messages' | 'thanks'
export type DeliveryPage = Exclude<Page, 'thanks'>

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
        capture_pageview: false, // screens share one page; screen views are tracked manually
        capture_pageleave: true,
        person_profiles: 'identified_only',
      })
      if (Object.keys(attribution).length) posthog.register(attribution)
      return posthog
    })
    .catch(() => null) // ad blockers etc.: the site keeps working
}

export type FaqId = 'is-it-free' | 'regular-whatsapp' | 'single-apartment' | 'tech-skills' | 'who-is-behind-lia'

/** Where a waitlist link sits on the page. */
export type WaitlistPlacement = 'hero' | 'after-first-template' | 'section' | 'after-copy'

type NoProps = Record<string, never>

/** Every custom event and its exact properties (documented in the README). */
export type EventProps = {
  /** went from home to the messages screen; `message` is null for the list itself */
  opened_messages: { from: 'home'; message: MessageId | null }
  copied_message: { message: MessageId; page: DeliveryPage }
  /** the browser blocked the copy */
  copy_failed: { message: MessageId; page: DeliveryPage }
  /** opened the Tally form from a PDF button */
  requested_pdf: { page: DeliveryPage }
  /** downloaded the PDF file (thank-you screen) */
  downloaded_pdf: { page: Page }
  /** went to the Tally form */
  clicked_waitlist: { page: DeliveryPage; placement: WaitlistPlacement }
  /** the once-per-visit waitlist prompt appeared after a successful copy */
  viewed_copy_prompt: { message: MessageId; page: DeliveryPage }
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

function reelFromAttribution() {
  return attribution.utm_content || attribution.reel || ''
}

/** Tally link carrying the origin, to match each answer to the page and the Reel.
 *  The Tally form needs hidden fields named "origin" and "reel". */
export function waitlistUrl(base: string, page: DeliveryPage) {
  const url = new URL(base)
  const fromPdf = attribution.origin === 'pdf' || attribution.utm_source === 'pdf'
  url.searchParams.set('origin', fromPdf ? 'pdf' : page)
  const reel = reelFromAttribution()
  if (reel) url.searchParams.set('reel', reel)
  return url.toString()
}

/** Tally link for the PDF request. Origin names the button; reel is the existing Reel tag if any. */
export function pdfRequestUrl(base: string, page: DeliveryPage) {
  const url = new URL(base)
  url.searchParams.set('origin', `pdf-request-${page}`)
  const reel = reelFromAttribution()
  if (reel) url.searchParams.set('reel', reel)
  return url.toString()
}
