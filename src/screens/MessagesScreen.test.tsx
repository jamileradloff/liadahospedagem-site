import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copyText } from '../clipboard'
import { MessagesScreen } from './MessagesScreen'

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('../clipboard', () => ({ copyText: vi.fn() }))
vi.mock('../analytics', async () => {
  const actual = await vi.importActual<typeof import('../analytics')>('../analytics')
  return { ...actual, track }
})

const mockedCopyText = vi.mocked(copyText)

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
    mockedCopyText.mockReset()
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
    expect(track).toHaveBeenCalledWith('clicked_waitlist', { page: 'messages', placement: 'after-first-template' })

    await userEvent.click(sectionLink)
    expect(track).toHaveBeenCalledWith('clicked_waitlist', { page: 'messages', placement: 'section' })
  })

  it('invites to the list once, next to the first copied message', async () => {
    mockedCopyText.mockResolvedValue(true)
    const { container } = render(<MessagesScreen anchor="" navigationKey={1} />)

    const first = screen.getByRole('article', { name: /Boas-vindas/ })
    const second = screen.getByRole('article', { name: /chegar mais cedo/ })
    await userEvent.click(within(first).getByRole('button', { name: 'Copiar mensagem' }))

    const prompt = first.querySelector('.waitlist-cta--after-copy') as HTMLElement
    expect(prompt).not.toBeNull()
    expect(second.querySelector('.waitlist-cta--after-copy')).toBeNull()
    expect(track).toHaveBeenCalledWith('viewed_copy_prompt', { message: 'welcome', page: 'messages' })
    expect(within(first).getByRole('button', { name: 'Copiada! Agora cola no WhatsApp' })).toHaveFocus()

    await userEvent.click(within(prompt).getByRole('link', { name: 'Quero entrar na lista de lançamento' }))
    expect(track).toHaveBeenCalledWith('clicked_waitlist', { page: 'messages', placement: 'after-copy' })

    await userEvent.click(within(second).getByRole('button', { name: 'Copiar mensagem' }))
    expect(container.querySelectorAll('.waitlist-cta--after-copy')).toHaveLength(1)
    expect(second.querySelector('.waitlist-cta--after-copy')).toBeNull()
    expect(track.mock.calls.filter((call) => call[0] === 'viewed_copy_prompt')).toHaveLength(1)
  })

  it('does not show the copy prompt when copying fails', async () => {
    mockedCopyText.mockResolvedValue(false)
    render(<MessagesScreen anchor="" navigationKey={1} />)

    await userEvent.click(within(screen.getByRole('article', { name: /Boas-vindas/ })).getByRole('button', { name: 'Copiar mensagem' }))

    expect(document.querySelector('.waitlist-cta--after-copy')).toBeNull()
    expect(track).not.toHaveBeenCalledWith('viewed_copy_prompt', expect.anything())
  })
})
