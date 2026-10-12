import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MessagesScreen } from './MessagesScreen'

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('../analytics', async () => {
  const actual = await vi.importActual<typeof import('../analytics')>('../analytics')
  return { ...actual, track }
})

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

describe('MessagesScreen waitlist prompt', () => {
  afterEach(() => {
    track.mockReset()
  })

  it('offers the launch waitlist once, between the first and second templates', async () => {
    const { container } = render(<MessagesScreen anchor="" navigationKey={1} />)

    const link = within(container.querySelector('.waitlist-cta') as HTMLElement).getByRole('link', {
      name: 'Quero entrar na lista de lançamento',
    })
    const sectionLink = within(container.querySelector('.waitlist') as HTMLElement).getByRole('link', {
      name: 'Quero entrar na lista de lançamento',
    })
    expect(sectionLink).toHaveAttribute('href', 'https://tally.so/r/9qzR1Q?origin=messages')
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(3)
    const first = articles[0]
    const second = articles[1]
    if (!first || !second) throw new Error('expected three templates')
    expect(first.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(link.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(link.closest('.waitlist-cta')).toHaveTextContent('Quer as 12 mensagens e o assistente da Lia?')
    expect(link).toHaveAttribute('href', 'https://tally.so/r/9qzR1Q?origin=messages')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener')

    await userEvent.click(link)
    expect(track).toHaveBeenCalledWith('clicked_waitlist', { page: 'messages' })
  })
})
