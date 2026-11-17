import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EXAMPLE } from '../content'
import { Example } from './Example'

const section = () => screen.getByRole('region', { name: '“Posso chegar mais cedo?”' })
const byText = (text: string) =>
  [...section().querySelectorAll('p, span, figcaption, summary')].find((el) => el.textContent === text)

describe('early check-in example', () => {
  it('shows the guest message, the AI draft and what to check, as in v2', () => {
    render(<Example />)

    const heading = within(section()).getByRole('heading', { level: 2, name: '“Posso chegar mais cedo?”' })
    expect(heading).toHaveAttribute('id', 'exemplo')
    expect(heading).toHaveAttribute('tabindex', '-1')
    for (const text of [
      'Exemplo · Situação 4',
      'Você quer responder com carinho. Mas ainda não sabe se a limpeza vai terminar a tempo.',
      'O que chegou',
      '“Oi! Nosso ônibus chega às 10h. Dá pra entrar no quarto às 11h?”',
      'O check-in é às 14h. Você ainda vai ver se a limpeza libera o quarto antes.',
      'Ficou assim · rascunho da IA',
      '“Oi! Tudo bem? 😊 Nosso horário normal de check-in é às 14h, mas vou verificar se conseguimos liberar o quarto antes, às 11h. Te dou um retorno até as 10h30, combinado?”',
      'Confere antes de mandar: o horário da reserva tá certo? A limpeza consegue liberar o quarto? Se ainda estiver verificando, dá um prazo que você consegue cumprir.',
    ]) {
      expect(byText(text), text).toBeDefined()
    }
    expect(byText('Confere antes de mandar: o horário da reserva tá certo? A limpeza consegue liberar o quarto? Se ainda estiver verificando, dá um prazo que você consegue cumprir.')?.querySelector('strong')?.textContent).toBe('Confere antes de mandar:')

    const caption = section().querySelector('figure > figcaption')
    expect(caption?.textContent).toBe(
      'Exemplo com dados fictícios. A resposta da IA pode variar: você confere os fatos e decide o que mandar.',
    )
  })

  it('keeps the instruction in a closed disclosure that opens on demand', async () => {
    render(<Example />)

    const summary = byText('Ver o pedido pra IA dessa situação') as HTMLElement
    const details = summary.closest('details') as HTMLDetailsElement
    expect(summary.tagName).toBe('SUMMARY')
    expect(details.open).toBe(false)

    await userEvent.click(summary)
    expect(details.open).toBe(true)
    expect(details.querySelector('pre')?.textContent).toBe(EXAMPLE.instruction)
    expect(
      byText(
        'Nesse exemplo, os [colchetes] foram preenchidos assim: check-in às 14h, decisão “ainda verificar”, retorno até as 10h30, sem alternativa.',
      ),
    ).toBeDefined()
  })
})
