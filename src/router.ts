import { useEffect, useSyncExternalStore } from 'react'
import { trackPageview } from './analytics'

// Minimal routing: two screens in a single page, so analytics can follow the same visit
// from the entry screen to the Tally click (cookieless tracking forgets the visitor on reload).
// In preview mode (VITE_PREVIEW=1) the location lives in memory and the URL never changes.

export type Screen = 'home' | 'messages'

/** User-facing path, kept in Portuguese because it is part of the content (and of the PDF links). */
export const MESSAGES_PATH = '/mensagens'

export type Location = {
  screen: Screen
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
  return { screen: path === MESSAGES_PATH ? 'messages' : 'home', anchor: decodeURIComponent(url.hash.slice(1)) }
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

/** Moves scroll and keyboard focus to where a navigation should land. Runs after the screen renders. */
export function landOn(current: Location) {
  const target = current.anchor ? document.getElementById(current.anchor) : null
  if (current.cause === 'initial' && !target) return

  const focusTarget = target ?? document.querySelector<HTMLElement>('main h1')
  if (current.scrollY !== null) {
    window.scrollTo(0, current.scrollY)
  } else if (target) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: current.cause === 'push' && !reduceMotion ? 'smooth' : 'auto', block: 'start' })
  } else {
    window.scrollTo(0, 0)
  }
  focusTarget?.focus({ preventScroll: true })
}
