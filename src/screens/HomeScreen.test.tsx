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
    expect(screen.getByText('Grátis e sem cadastro.')).toBeInTheDocument()

    await userEvent.click(link)
    expect(track).toHaveBeenCalledWith('clicked_waitlist', { page: 'home' })
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
  })
})
