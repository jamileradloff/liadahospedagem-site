import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from './Hero'

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('../../analytics', async () => {
  const actual = await vi.importActual<typeof import('../../analytics')>('../../analytics')
  return { ...actual, track }
})

const HOTMART = 'https://pay.hotmart.com/T108525255F'

describe('hero checkout clicks', () => {
  afterEach(() => {
    track.mockReset()
  })

  it('while pending, sends no clicked_checkout', async () => {
    render(<Hero checkoutLive={false} />)

    await userEvent.click(screen.getByRole('link', { name: 'Ver um exemplo ↓' }))
    expect(track).not.toHaveBeenCalled()
  })

  it('when live, the buy pill sends clicked_checkout from the hero and the example link does not', async () => {
    render(<Hero checkoutLive />)

    const buy = screen.getByRole('link', { name: 'Quero meu PDF por R$10' })
    expect(buy).toHaveAttribute('href', HOTMART)
    buy.addEventListener('click', (event) => event.preventDefault())
    await userEvent.click(buy)
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('clicked_checkout', { placement: 'hero' })

    track.mockClear()
    await userEvent.click(screen.getByRole('link', { name: 'Antes, quero ver um exemplo ↓' }))
    expect(track).not.toHaveBeenCalled()
  })
})
