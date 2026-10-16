import { useEffect, useSyncExternalStore } from 'react'
import { trackPageview, type Page } from './analytics'

// Minimal routing: screens in a single page, so analytics can follow the same visit
// from the entry screen to the Tally click (cookieless tracking forgets the visitor on reload).
// In preview mode (VITE_PREVIEW=1) the location lives in memory and the URL never changes.

/** User-facing paths, kept in Portuguese because they are part of the content (and of the PDF links). */
export const MESSAGES_PATH = '/mensagens'
export const THANKS_PATH = '/obrigado'

export type Location = {
  screen: Page
  anchor: string
  /** How this location was reached: page load, in-app link, or history/hash change. */
  cause: 'initial' | 'push' | 'pop'
  /** Scroll position saved when the user left this history entry, restored on Back/Forward. */
  scrollY: number | null
  /** Changes on every navigation, even to the same URL. */
  key: number
}

const PREVIEW = import.meta.env.VITE_PREVIEW === '1'

function parse(target: string): Pick<Location, 'screen' | 'anchor'> {
  const url = new URL(target, window.location.origin)
  const path = url.pathname.replace(/\/+$/, '')
  const screen = path === MESSAGES_PATH ? 'messages' : path === THANKS_PATH ? 'thanks' : 'home'
  return { screen, anchor: decodeURIComponent(url.hash.slice(1)) }
}

function savedScrollY(): number | null {
  const state: unknown = window.history.state
  if (state && typeof state === 'object' && 'scrollY' in state && typeof state.scrollY === 'number') {
    return state.scrollY
  }
  return null
}

let location: Location = {
  ...(PREVIEW ? { screen: 'home', anchor: '' } : parse(window.location.href)),
  cause: 'initial',
  scrollY: null,
  key: 0,
}
const listeners = new Set<() => void>()

function setLocation(next: Omit<Location, 'key'>) {
  location = { ...next, key: location.key + 1 }
  listeners.forEach((listener) => listener())
}

function onHistoryChange() {
  const next = parse(window.location.href)
  // Back/Forward between hash entries fires popstate and then hashchange for the same entry.
  if (location.cause === 'pop' && next.screen === location.screen && next.anchor === location.anchor) return
  setLocation({ ...next, cause: 'pop', scrollY: savedScrollY() })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1 && !PREVIEW) {
    window.addEventListener('popstate', onHistoryChange)
    window.addEventListener('hashchange', onHistoryChange)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener('popstate', onHistoryChange)
      window.removeEventListener('hashchange', onHistoryChange)
    }
  }
}

export function useLocation(): Location {
  const current = useSyncExternalStore(subscribe, () => location)
  useEffect(() => {
    trackPageview()
  }, [current.screen])
  return current
}

export function navigate(target: string) {
  if (!PREVIEW) {
    window.history.replaceState({ ...(window.history.state ?? {}), scrollY: window.scrollY }, '')
    window.history.pushState({}, '', target)
  }
  setLocation({ ...parse(target), cause: 'push', scrollY: null })
}

let landedScreen: Page | null = null

/** Moves scroll and keyboard focus to where a navigation should land. Runs after the screen renders. */
export function landOn(current: Location) {
  const previousScreen = landedScreen
  landedScreen = current.screen
  const target = current.anchor ? document.getElementById(current.anchor) : null
  // A plain load of home or messages leaves focus where the browser put it. The thank-you screen
  // is a landing after Tally, so its heading takes focus even on the first load.
  if (current.cause === 'initial' && !target && current.screen !== 'thanks') return

  const focusTarget = target ?? document.querySelector<HTMLElement>('main h1')
  if (current.scrollY !== null) {
    window.scrollTo({ top: current.scrollY, behavior: 'instant' })
  } else if (target) {
    // Animate only jumps within a screen. After a screen change the old scroll offset is meaningless, and an
    // animation still running from it would override a quick Back (Chromium doesn't cancel it).
    const sameScreen = current.cause === 'push' && previousScreen === current.screen
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: sameScreen && !reduceMotion ? 'smooth' : 'instant', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  focusTarget?.focus({ preventScroll: true })
}
