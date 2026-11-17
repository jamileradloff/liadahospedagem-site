import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { About } from './About'

describe('about', () => {
  it('says who made the guide, with a decorative Caderninho mark and the Kit link', () => {
    render(<About />)

    const section = screen.getByRole('region', { name: 'Hospitalidade primeiro. IA pra ajudar.' })
    expect(within(section).getByText('Quem fez')).toBeInTheDocument()
    expect([...section.querySelectorAll('p')].map((p) => p.textContent)).toEqual([
      'Pensado pra quem cuida de 1 a 5 imóveis. Também pode ajudar em pequenas pousadas, chalés e hotéis independentes.',
      'A Lia é uma personagem criada com IA. Por trás dela está Jamile Radloff: mestrado em gestão da hospitalidade, experiência em reservas e aluguel por temporada, além de experiência como engenheira de software.',
      'O Kit Recepção Inteligente está em desenvolvimento. A ideia é guardar as informações da sua hospedagem pra criar mensagens personalizadas sem precisar explicar tudo de novo.',
    ])
    expect(within(section).getByText('Kit Recepção Inteligente').tagName).toBe('STRONG')

    const mark = section.querySelector('svg') as SVGElement
    expect(mark.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(mark).toHaveAttribute('focusable', 'false')

    expect(within(section).getByRole('link', { name: 'Quero receber novidades do Kit' })).toHaveAttribute(
      'href',
      'https://tally.so/r/xVDy9G?origin=pede-assim',
    )
  })
})
