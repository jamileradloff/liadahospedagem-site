import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { About } from './About'

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('../../analytics', async () => {
  const actual = await vi.importActual<typeof import('../../analytics')>('../../analytics')
  return { ...actual, track }
})

describe('about', () => {
  afterEach(() => {
    track.mockReset()
  })

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

  it('sends clicked_kit_updates with no properties', async () => {
    render(<About />)

    const link = screen.getByRole('link', { name: 'Quero receber novidades do Kit' })
    expect(link).toHaveAttribute('href', 'https://tally.so/r/xVDy9G?origin=pede-assim')
    link.addEventListener('click', (event) => event.preventDefault())
    await userEvent.click(link)
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('clicked_kit_updates')
  })
})
