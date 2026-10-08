// Instagram's in-app browser sometimes blocks the modern clipboard API.
// Try it first, then fall back to the legacy approach.
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the fallback
  }
  return legacyCopy(text)
}

function legacyCopy(text: string): boolean {
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.setAttribute('aria-hidden', 'true')
  textarea.tabIndex = -1
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.opacity = '0'
  try {
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, text.length)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
    window.getSelection()?.removeAllRanges()
    previousFocus?.focus({ preventScroll: true })
  }
}
