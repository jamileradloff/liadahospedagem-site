import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HowToUse } from './HowToUse'

const section = () => screen.getByRole('region', { name: 'Copia, preenche, confere e manda.' })

describe('how to use', () => {
  it('gives the three steps as an ordered list, with decorative step numbers', () => {
    render(<HowToUse />)

    expect(within(section()).getByText('Como usar')).toBeInTheDocument()
    expect(within(section()).getByRole('heading', { level: 2 })).toHaveAttribute('id', 'como-usar')

    const steps = within(section().querySelector('ol') as HTMLOListElement).getAllByRole('listitem')
    expect(
      steps.map((step) => [
        step.querySelector('.sales-step-num')?.getAttribute('aria-hidden'),
        step.querySelector('.sales-step-num')?.textContent,
        step.querySelector('h3')?.textContent,
        step.querySelector('p')?.textContent,
      ]),
    ).toEqual([
      ['true', '01', 'Copia o pedido', 'Escolhe a situação e copia o bloco “Pede assim pra IA”. O primeiro, do desconto, vem preenchido pra você ver como fica.'],
      ['true', '02', 'Coloca os dados da reserva', 'Troca o que está entre [colchetes] e cola no ChatGPT. Se a IA te fizer uma pergunta, responde ali primeiro.'],
      ['true', '03', 'Confere antes de mandar', 'Revisa os fatos, ajusta o tom e manda pelo mesmo canal da reserva.'],
    ])
  })

  it('says what the visitor needs, and what to remove before pasting', () => {
    render(<HowToUse />)

    expect(
      within(section()).getByText(
        'Você precisa abrir o PDF, acessar o ChatGPT e copiar e colar textos. Não precisa conectar Airbnb, Booking ou WhatsApp. Antes de colar a mensagem do hóspede, tira sobrenome, telefone, número da reserva e código de acesso.',
      ),
    ).toBeInTheDocument()
  })
})
