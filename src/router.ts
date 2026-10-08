import { useEffect, useState } from 'react'
import { trackPageview } from './analytics'

// Minimal routing: two screens in a single page, so analytics can follow the same visit
// from the entry screen to the Tally click (cookieless tracking forgets the visitor on reload).
// In preview mode (VITE_PREVIEW=1) the screen lives in memory and the URL never changes.

export type Screen = 'home' | 'messages'

/** User-facing path, kept in Portuguese because it is part of the content (and of the PDF links). */
export const MESSAGES_PATH = '/mensagens'

const PREVIEW = import.meta.env.VITE_PREVIEW === '1'
let memoryScreen: Screen = 'home'
let memoryAnchor = ''

function currentScreen(): Screen {
  if (PREVIEW) return memoryScreen
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === MESSAGES_PATH ? 'messages' : 'home'
}

export function currentAnchor(): string {
  return PREVIEW ? memoryAnchor : window.location.hash.slice(1)
}

export function useScreen(): Screen {
  const [screen, setScreen] = useState<Screen>(currentScreen)
  useEffect(() => {
    const onChange = () => setScreen(currentScreen())
    window.addEventListener('popstate', onChange)
    return () => window.removeEventListener('popstate', onChange)
  }, [])
  useEffect(() => {
    trackPageview()
  }, [screen])
  return screen
}

export function navigate(target: string) {
  const [path, hash = ''] = target.split('#')
  if (PREVIEW) {
    memoryScreen = path.startsWith(MESSAGES_PATH) ? 'messages' : 'home'
    memoryAnchor = hash
  } else {
    window.history.pushState({}, '', target)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
  if (!hash) window.scrollTo(0, 0)
}
