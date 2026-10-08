import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MessagesScreen } from './MessagesScreen'

const card = (anchor: string) => document.getElementById(anchor)

describe('MessagesScreen highlight', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('highlights the landed message briefly, and again when the same message is navigated to', () => {
    const { rerender } = render(<MessagesScreen anchor="cedo" navigationKey={1} />)
    expect(card('cedo')).toHaveClass('message-card--highlight')
    expect(card('boasvindas')).not.toHaveClass('message-card--highlight')

    act(() => {
      vi.advanceTimersByTime(2200)
    })
    expect(card('cedo')).not.toHaveClass('message-card--highlight')

    rerender(<MessagesScreen anchor="cedo" navigationKey={2} />)
    expect(card('cedo')).toHaveClass('message-card--highlight')
  })

  it('highlights nothing without an anchor', () => {
    render(<MessagesScreen anchor="" navigationKey={1} />)
    expect(screen.getAllByRole('article').filter((el) => el.classList.contains('message-card--highlight'))).toEqual([])
  })
})
