import { useState } from 'react'
import { copyText } from './clipboard'
import { track, type Page } from './analytics'
import type { MessageId } from './content'

export type CopyStatus = 'idle' | 'copied' | 'failed'

/** Copies a message, tracks the event and returns the button state. */
export function useCopy(message: MessageId, text: string, page: Page) {
  const [status, setStatus] = useState<CopyStatus>('idle')

  async function copy() {
    const ok = await copyText(text)
    setStatus(ok ? 'copied' : 'failed')
    track(ok ? 'copied_message' : 'copy_failed', { message, page })
    if (ok) window.setTimeout(() => setStatus('idle'), 3000)
  }

  return { status, copy }
}

export const COPY_FAILED_HINT =
  'Seu navegador não deixou copiar. Toca e segura no texto do balão para selecionar e copiar.'
