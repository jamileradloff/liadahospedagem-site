import { useCallback, useEffect, useRef, useState } from 'react'
import { copyText } from './clipboard'
import { track, type Page } from './analytics'
import type { MessageId } from './content'

export type CopyStatus = 'idle' | 'copied' | 'failed'

export const COPIED_FEEDBACK_MS = 3000

/** Copies a message, tracks the event and returns the button state. */
export function useCopy(message: MessageId, text: string, page: Page) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const timeout = useRef<number | undefined>(undefined)
  // Only the latest request may update the state; unmounting invalidates all of them.
  const latestRequest = useRef(0)

  useEffect(
    () => () => {
      latestRequest.current += 1
      window.clearTimeout(timeout.current)
    },
    [],
  )

  const copy = useCallback(async () => {
    const request = ++latestRequest.current
    window.clearTimeout(timeout.current)
    setStatus('idle')
    const ok = await copyText(text)
    if (request !== latestRequest.current) return
    setStatus(ok ? 'copied' : 'failed')
    track(ok ? 'copied_message' : 'copy_failed', { message, page })
    if (ok) timeout.current = window.setTimeout(() => setStatus('idle'), COPIED_FEEDBACK_MS)
  }, [message, text, page])

  return { status, copy }
}

export const COPIED_ANNOUNCEMENT = 'Mensagem copiada. Agora cola no WhatsApp.'

/** Manual-copy instructions for mouse and touch, pointing at the bubble that holds the template. */
export function copyFailedHint(bubble: 'acima' | 'abaixo') {
  return `Seu navegador não deixou copiar. Seleciona o texto do balão ${bubble} e copia: no celular, toca e segura no texto; no computador, clica e arrasta por cima dele.`
}
