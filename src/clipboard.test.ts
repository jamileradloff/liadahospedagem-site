import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copyText } from './clipboard'

function setClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  })
}

function setExecCommand(impl: () => boolean) {
  const execCommand = vi.fn(impl)
  Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
  return execCommand
}

describe('copyText', () => {
  let button: HTMLButtonElement

  beforeEach(() => {
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true })
    button = document.createElement('button')
    document.body.appendChild(button)
    button.focus()
  })

  afterEach(() => {
    button.remove()
    setClipboard(undefined)
  })

  it('uses the modern clipboard API when it works', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard(writeText)
    const execCommand = setExecCommand(() => true)

    await expect(copyText('oi')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('oi')
    expect(execCommand).not.toHaveBeenCalled()
  })

  it('falls back to the legacy copy, then cleans up and restores focus', async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error('blocked')))
    let copiedValue = ''
    const execCommand = setExecCommand(() => {
      copiedValue = (document.activeElement as HTMLTextAreaElement).value
      return true
    })

    await expect(copyText('oi')).resolves.toBe(true)
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(copiedValue).toBe('oi')
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.activeElement).toBe(button)
  })

  it('reports failure when every method is blocked', async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error('blocked')))
    setExecCommand(() => false)

    await expect(copyText('oi')).resolves.toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.activeElement).toBe(button)
  })

  it('cleans up when the legacy copy throws', async () => {
    setClipboard(undefined)
    setExecCommand(() => {
      throw new Error('unsupported')
    })

    await expect(copyText('oi')).resolves.toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.activeElement).toBe(button)
  })
})
