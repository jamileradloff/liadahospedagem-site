import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Location } from '../router'
import { SalesScreen } from './SalesScreen'

const HOTMART = 'https://pay.hotmart.com/T108525255F'
const location: Location = { screen: 'sales', anchor: '', instruction: '', cause: 'initial', scrollY: null, key: 0 }

const hero = () => document.querySelector<HTMLElement>('.sales-hero') as HTMLElement
const hotmartLinks = () => [...document.querySelectorAll('a')].filter((a) => a.href.includes('pay.hotmart.com'))
const paragraph = (text: string) => [...document.querySelectorAll('p')].find((p) => p.textContent === text)

describe('hero, pending checkout', () => {
  it('shows the offer and sends the visitor to the example', () => {
    render(<SalesScreen location={location} />)

    expect(
      within(hero()).getByText(
        '12 instruções testadas no ChatGPT grátis, uma pra cada situação com hóspede. Você preenche com os dados da sua reserva, a IA escreve um rascunho e você confere antes de mandar.',
      ),
    ).toBeInTheDocument()
    const price = within(hero()).getByText('R$10').closest('p')
    expect(price?.querySelector('strong')?.textContent).toBe('R$10')
    expect(price?.querySelector('span')?.textContent).toBe('PDF de 15 páginas, feito pro celular · pagamento único')

    const links = within(hero()).getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveTextContent('Ver um exemplo ↓')
    expect(links[0]).toHaveAttribute('href', '#exemplo')
  })

  it('says delivery is by Hotmart and that the checkout is pending, with no Hotmart link anywhere', () => {
    render(<SalesScreen location={location} />)

    expect(paragraph('Entrega pela Hotmart após a confirmação do pagamento.')).toBeVisible()
    expect(paragraph('Checkout pendente. A compra ainda não está disponível.')).toBeVisible()
    expect(hotmartLinks()).toHaveLength(0)
  })
})

describe('hero, live checkout', () => {
  it('links the main button to the Hotmart checkout in the same tab, and keeps a link to the example', () => {
    render(<SalesScreen location={location} checkoutLive />)

    const buy = within(hero()).getByRole('link', { name: 'Quero meu PDF por R$10' })
    expect(buy).toHaveAttribute('href', HOTMART)
    expect(buy).not.toHaveAttribute('target')
    expect(buy.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(within(hero()).getByRole('link', { name: 'Antes, quero ver um exemplo ↓' })).toHaveAttribute('href', '#exemplo')
    expect(within(hero()).queryByRole('link', { name: 'Ver um exemplo ↓' })).not.toBeInTheDocument()

    expect(paragraph('Entrega pela Hotmart após a confirmação do pagamento.')).toBeVisible()
    expect(paragraph('Checkout pendente. A compra ainda não está disponível.')).toBeUndefined()
  })
})

describe('cover', () => {
  it('describes the cover, reserves its size and loads it right away', () => {
    render(<SalesScreen location={location} />)

    const cover = screen.getByRole('img', {
      name: 'Capa do PDF Pede assim pra IA: mensagens pra hóspedes, da Lia da Hospedagem',
    })
    expect(cover).toHaveAttribute('width', '600')
    expect(cover).toHaveAttribute('height', '600')
    expect(cover).not.toHaveAttribute('loading', 'lazy')
  })
})
