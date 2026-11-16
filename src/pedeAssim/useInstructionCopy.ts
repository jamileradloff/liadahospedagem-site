import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { track } from '../analytics'
import { copyText } from '../clipboard'

export const COPIED_STATUS = 'Instrução copiada. Agora cole na IA.'
export const SELECTED_STATUS = 'Texto selecionado. Use a opção de copiar do aparelho e cole na IA.'

function selectContents(element: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(element)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  element.scrollIntoView({ block: 'nearest' })
}

/** Copies the instruction; if the browser blocks it, selects the text so it can be copied by hand. */
export function useInstructionCopy(slug: string, prompt: string, promptElement: RefObject<HTMLElement>) {
  const [status, setStatus] = useState('')
  // Only the latest request may update the state; unmounting invalidates all of them.
  const latestRequest = useRef(0)

  useEffect(
    () => () => {
      latestRequest.current += 1
    },
    [],
  )

  const copy = useCallback(async () => {
    const request = ++latestRequest.current
    // Emptying the live region first makes screen readers announce the same message again.
    setStatus('')
    const ok = await copyText(prompt)
    if (request !== latestRequest.current) return
    if (ok) {
      setStatus(COPIED_STATUS)
      track('copied_instruction', { instruction: slug })
    } else {
      if (promptElement.current) selectContents(promptElement.current)
      setStatus(SELECTED_STATUS)
    }
  }, [slug, prompt, promptElement])

  return { status, copy }
}
