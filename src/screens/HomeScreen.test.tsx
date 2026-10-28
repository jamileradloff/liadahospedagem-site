import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyText } from '../clipboard'
import { MESSAGE_BY_ID } from '../content'
import { COPIED_ANNOUNCEMENT } from '../useCopy'
import { HomeScreen } from './HomeScreen'

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('../clipboard', () => ({ copyText: vi.fn() }))
vi.mock('../analytics', async () => {
  const actual = await vi.importActual<typeof import('../analytics')>('../analytics')
  return { ...actual, track }
})

const mockedCopyText = vi.mocked(copyText)
const welcome = MESSAGE_BY_ID.welcome

function statusesWithText(text: string | RegExp) {
  return screen.getAllByRole('status').filter((el) => within(el).queryByText(text))
}

describe('HomeScreen welcome copy', () => {
  afterEach(() => {
    mockedCopyText.mockReset()
    track.mockReset()
  })

  it('offers the launch waitlist under the hero actions', async () => {
    const { container } = render(<HomeScreen />)

    const link = within(container.querySelector('.waitlist-cta') as HTMLElement).getByRole('link', {
      name: 'Quero entrar na lista de lançamento',
    })
    const sectionLink = within(container.querySelector('.waitlist') as HTMLElement).getByRole('link', {
      name: 'Quero entrar na lista de lançamento',
    })
    expect(sectionLink).toHaveAttribute('href', 'https://tally.so/r/9qzR1Q?origin=home')
    const prompt = link.parentElement
    expect(prompt).toHaveTextContent('Quer as 12 mensagens e o assistente da Lia?')
    expect(prompt).not.toHaveAttribute('role', 'status')
    expect(link).toHaveClass('button', 'button--outline')
    expect(link).toHaveAttribute('href', 'https://tally.so/r/9qzR1Q?origin=home')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener')
    expect(screen.getByText('Copiar é grátis e sem cadastro.')).toBeInTheDocument()
    expect(
      screen.getByText('É. Copiar é grátis e sem cadastro. Se quiser o PDF, é só deixar seu e-mail.'),
    ).toBeInTheDocument()
    const pdf = screen.getAllByRole('link', { name: 'Receber o Caderninho em PDF' })[0]
    if (!pdf) throw new Error('expected a PDF request link')
    expect(pdf).toHaveAttribute('href', 'https://tally.so/r/9qzR1Q?origin=pdf-request-home')
    expect(pdf).toHaveAttribute('target', '_blank')
    expect(pdf).toHaveAttribute('rel', 'noopener')

    await userEvent.click(pdf)
    expect(track).toHaveBeenCalledWith('requested_pdf', { page: 'home' })

    await userEvent.click(link)
    expect(track).toHaveBeenCalledWith('clicked_waitlist', { page: 'home', placement: 'hero' })

    await userEvent.click(sectionLink)
    expect(track).toHaveBeenCalledWith('clicked_waitlist', { page: 'home', placement: 'section' })
  })

  it('previews the welcome template as a tap target outside the tab order', async () => {
    const { container } = render(<HomeScreen />)

    const preview = container.querySelector('.hero__preview') as HTMLElement
    expect(preview.tagName).toBe('A')
    expect(preview).toHaveAttribute('href', '/mensagens#boasvindas')
    expect(preview).toHaveAttribute('aria-hidden', 'true')
    expect(preview).toHaveAttribute('tabindex', '-1')
    expect(preview.querySelector('.bubble--truncated')).not.toBeNull()

    await userEvent.click(preview)
    expect(track).toHaveBeenCalledWith('opened_messages', { from: 'home', message: 'welcome' })
  })

  it('reveals the welcome template for manual copying when the browser blocks it', async () => {
    mockedCopyText.mockResolvedValue(false)
    const { container } = render(<HomeScreen />)

    await userEvent.click(screen.getByRole('button', { name: 'Copiar a de boas-vindas' }))

    expect(statusesWithText(/Seu navegador não deixou copiar/)).toHaveLength(1)
    const fallback = container.querySelector('.copy-fallback')
    expect(fallback?.querySelector('.bubble__text')?.textContent).toBe(welcome.text)
    expect(within(fallback as HTMLElement).getByRole('link', { name: 'Abrir a mensagem de boas-vindas' })).toHaveAttribute(
      'href',
      '/mensagens#boasvindas',
    )
    expect(container.querySelector('.waitlist-cta--after-copy')).toBeNull()
    expect(track).not.toHaveBeenCalledWith('viewed_copy_prompt', expect.anything())
  })

  it('announces a successful copy once', async () => {
    mockedCopyText.mockResolvedValue(true)
    const { container } = render(<HomeScreen />)

    const button = screen.getByRole('button', { name: 'Copiar a de boas-vindas' })
    await userEvent.click(button)

    expect(mockedCopyText).toHaveBeenCalledWith(welcome.text)
    expect(statusesWithText(COPIED_ANNOUNCEMENT)).toHaveLength(1)
    expect(container.querySelector('.copy-fallback')).toBeNull()
    expect(button).toHaveFocus()
    expect(track).toHaveBeenCalledWith('viewed_copy_prompt', { message: 'welcome', page: 'home' })

    const prompt = container.querySelector('.waitlist-cta--after-copy') as HTMLElement
    const promptLink = within(prompt).getByRole('link', { name: 'Quero entrar na lista de lançamento' })
    expect(prompt).toHaveTextContent('Copiou')
    expect(prompt).toHaveTextContent('Essa é 1 de 12 mensagens.')
    expect(prompt).toHaveTextContent('Quer as outras 9 e o assistente da Lia?')
    expect(promptLink).toHaveAttribute('href', 'https://tally.so/r/9qzR1Q?origin=home')
    expect(promptLink).toHaveAttribute('target', '_blank')
    expect(promptLink).toHaveAttribute('rel', 'noopener')
    expect(button.compareDocumentPosition(promptLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    await userEvent.click(promptLink)
    expect(track).toHaveBeenCalledWith('clicked_waitlist', { page: 'home', placement: 'after-copy' })

    await userEvent.click(screen.getByRole('button', { name: 'Copiada! Agora cola no WhatsApp' }))
    expect(container.querySelectorAll('.waitlist-cta--after-copy')).toHaveLength(1)
    expect(track.mock.calls.filter((call) => call[0] === 'viewed_copy_prompt')).toHaveLength(1)
  })
})
