import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copyText } from './clipboard'
import { COPIED_FEEDBACK_MS, useCopy } from './useCopy'

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('./clipboard', () => ({ copyText: vi.fn() }))
vi.mock('./analytics', async () => {
  const actual = await vi.importActual<typeof import('./analytics')>('./analytics')
  return { ...actual, track }
})

const mockedCopyText = vi.mocked(copyText)

function deferred() {
  let resolve!: (ok: boolean) => void
  const promise = new Promise<boolean>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('useCopy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    mockedCopyText.mockReset()
    track.mockReset()
  })

  it('returns to idle after the feedback interval', async () => {
    mockedCopyText.mockResolvedValue(true)
    const { result } = renderHook(() => useCopy('welcome', 'oi', 'home'))

    await act(() => result.current.copy())
    expect(result.current.status).toBe('copied')

    act(() => {
      vi.advanceTimersByTime(COPIED_FEEDBACK_MS)
    })
    expect(result.current.status).toBe('idle')
  })

  it('gives a repeated copy a full feedback interval', async () => {
    mockedCopyText.mockResolvedValue(true)
    const { result } = renderHook(() => useCopy('welcome', 'oi', 'home'))

    await act(() => result.current.copy())
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    await act(() => result.current.copy())

    act(() => {
      vi.advanceTimersByTime(COPIED_FEEDBACK_MS - 1)
    })
    expect(result.current.status).toBe('copied')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.status).toBe('idle')
  })

  it('ignores an older request that finishes after a newer one', async () => {
    const first = deferred()
    mockedCopyText.mockReturnValueOnce(first.promise).mockResolvedValueOnce(true)
    const { result } = renderHook(() => useCopy('welcome', 'oi', 'home'))

    let firstCopy!: Promise<void>
    act(() => {
      firstCopy = result.current.copy()
    })
    await act(() => result.current.copy())
    expect(result.current.status).toBe('copied')

    await act(async () => {
      first.resolve(false)
      await firstCopy
    })
    expect(result.current.status).toBe('copied')
  })

  it('offers the waitlist prompt on the first successful copy of the visit', async () => {
    mockedCopyText.mockResolvedValue(true)
    const first = renderHook(() => useCopy('welcome', 'oi', 'home'))
    const second = renderHook(() => useCopy('checkout', 'tchau', 'messages'))

    await act(() => first.result.current.copy())
    expect(first.result.current.showPrompt).toBe(true)
    expect(track).toHaveBeenCalledWith('viewed_copy_prompt', { message: 'welcome', page: 'home' })

    act(() => {
      vi.advanceTimersByTime(COPIED_FEEDBACK_MS)
    })
    expect(first.result.current.status).toBe('idle')
    expect(first.result.current.showPrompt).toBe(true)

    await act(() => second.result.current.copy())
    expect(second.result.current.showPrompt).toBe(false)
    expect(track.mock.calls.filter((call) => call[0] === 'viewed_copy_prompt')).toHaveLength(1)
  })

  it('does not offer the prompt when the copy fails', async () => {
    mockedCopyText.mockResolvedValue(false)
    const { result } = renderHook(() => useCopy('welcome', 'oi', 'home'))

    await act(() => result.current.copy())
    expect(result.current.status).toBe('failed')
    expect(result.current.showPrompt).toBe(false)
    expect(track).not.toHaveBeenCalledWith('viewed_copy_prompt', expect.anything())
  })

  it('clears pending feedback work on unmount', async () => {
    mockedCopyText.mockResolvedValue(true)
    const { result, unmount } = renderHook(() => useCopy('welcome', 'oi', 'home'))

    await act(() => result.current.copy())
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
