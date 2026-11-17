import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer'

describe('footer', () => {
  it('credits Jamile, discloses that Lia is made with AI, and links the three profiles by their logos', () => {
    render(<Footer />)

    const footer = screen.getByRole('contentinfo')
    expect([...footer.querySelectorAll('p')].map((p) => p.textContent)).toEqual([
      'Lia da Hospedagem · criada por Jamile Radloff',
      '🤖 A Lia é uma personagem criada com IA.',
    ])
    expect(footer).not.toHaveTextContent('@liadahospedagem')
    expect(footer).not.toHaveTextContent('Suporte, reembolso e termos de compra')

    const disclosure = within(footer).getByText('🤖 A Lia é uma personagem criada com IA.')
    const social = within(footer).getByRole('navigation', { name: 'Redes sociais' })
    expect(disclosure.compareDocumentPosition(social) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const links = within(footer).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual([
      '@liadahospedagem no Instagram',
      '@liadahospedagem no TikTok',
      'Lia da Hospedagem no Facebook',
    ])
    expect(links[0]).toHaveAttribute('href', 'https://www.instagram.com/liadahospedagem/')
    expect(links[1]).toHaveAttribute('href', 'https://www.tiktok.com/@liadahospedagem')
    expect(links[2]).toHaveAttribute('href', 'https://www.facebook.com/liadahospedagem')
    for (const link of links) {
      expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener')
    }
  })
})
