import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Closing } from './Closing'

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('../../analytics', async () => {
  const actual = await vi.importActual<typeof import('../../analytics')>('../../analytics')
  return { ...actual, track }
})

const HOTMART = 'https://pay.hotmart.com/T108525255F'
const section = () => screen.getByRole('region', { name: 'Na próxima pergunta repetida, já tem o pedido.' })
const paragraph = (text: string) => [...section().querySelectorAll('p')].find((p) => p.textContent === text)

describe('closing purchase card', () => {
  afterEach(() => {
    track.mockReset()
  })

  it('sums up the offer', () => {
    render(<Closing checkoutLive={false} />)

    expect(section()).toHaveAttribute('id', 'comprar')
    expect(
      paragraph('Escolhe a situação, preenche os detalhes e pede um rascunho. O jeito de receber continua sendo seu.'),
    ).toBeDefined()
    expect(within(section()).getByRole('heading', { level: 3, name: 'Pede assim pra IA: mensagens pra hóspedes' })).toBeInTheDocument()
    expect(within(section()).getByText('R$10')).toBeInTheDocument()
    expect(paragraph('PDF digital · pagamento único')).toBeDefined()
    expect(within(section()).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      '✓12 instruções testadas no ChatGPT grátis',
      '✓15 páginas, feitas pro celular',
      '✓Exemplo e o que conferir em cada situação',
    ])
  })

  it('while pending, shows a disabled button described by the pending note, and no Hotmart link', () => {
    render(<Closing checkoutLive={false} />)

    const button = within(section()).getByRole('button', { name: 'Quero meu PDF por R$10' })
    expect(button).toBeDisabled()
    const note = paragraph('Checkout pendente. A compra ainda não está disponível.') as HTMLElement
    expect(note).toBeVisible()
    expect(button).toHaveAttribute('aria-describedby', note.id)
    expect(button).toHaveAccessibleDescription('Checkout pendente. A compra ainda não está disponível.')
    expect(within(section()).queryByRole('link')).not.toBeInTheDocument()
    expect(paragraph('Compra pela Hotmart. O acesso chega por e-mail depois da confirmação do pagamento.')).toBeUndefined()
  })

  it('when live, links to the Hotmart checkout in the same tab and explains delivery', () => {
    render(<Closing checkoutLive />)

    const link = within(section()).getByRole('link', { name: 'Quero meu PDF por R$10' })
    expect(link).toHaveAttribute('href', HOTMART)
    expect(link).not.toHaveAttribute('target')
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(within(section()).queryByRole('button')).not.toBeInTheDocument()
    expect(paragraph('Compra pela Hotmart. O acesso chega por e-mail depois da confirmação do pagamento.')).toBeDefined()
    expect(paragraph('Checkout pendente. A compra ainda não está disponível.')).toBeUndefined()
  })

  it('while pending, the disabled button sends no clicked_checkout', async () => {
    render(<Closing checkoutLive={false} />)

    const button = within(section()).getByRole('button', { name: 'Quero meu PDF por R$10' })
    await userEvent.click(button)
    expect(track).not.toHaveBeenCalled()
  })

  it('when live, the card link sends clicked_checkout from the closing card', async () => {
    render(<Closing checkoutLive />)

    const link = within(section()).getByRole('link', { name: 'Quero meu PDF por R$10' })
    expect(link).toHaveAttribute('href', HOTMART)
    link.addEventListener('click', (event) => event.preventDefault())
    await userEvent.click(link)
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('clicked_checkout', { placement: 'closing' })
  })
})
