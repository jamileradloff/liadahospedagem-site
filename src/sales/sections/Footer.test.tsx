import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer'

describe('footer', () => {
  it('credits Jamile, discloses that Lia is made with AI, and says the purchase terms are still open', () => {
    render(<Footer />)

    const footer = screen.getByRole('contentinfo')
    expect([...footer.querySelectorAll('p')].map((p) => p.textContent)).toEqual([
      'Lia da Hospedagem · criado por Jamile Radloff · @liadahospedagem',
      '🤖 A Lia é uma personagem criada com IA.',
      'Suporte, reembolso e termos de compra: a confirmar.',
    ])
    expect(within(footer).getByRole('link', { name: '@liadahospedagem' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/liadahospedagem/',
    )
  })
})
