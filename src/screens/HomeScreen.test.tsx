import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyText } from '../clipboard'
import { MESSAGES } from '../content'
import { COPIED_ANNOUNCEMENT } from '../useCopy'
import { HomeScreen } from './HomeScreen'

vi.mock('../clipboard', () => ({ copyText: vi.fn() }))

const mockedCopyText = vi.mocked(copyText)
const welcome = MESSAGES.find((m) => m.id === 'welcome')!

function statusesWithText(text: string | RegExp) {
  return screen.getAllByRole('status').filter((el) => within(el).queryByText(text))
}

describe('HomeScreen welcome copy', () => {
  afterEach(() => {
    mockedCopyText.mockReset()
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
