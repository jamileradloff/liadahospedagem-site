import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Faq } from './Faq'

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('../../analytics', async () => {
  const actual = await vi.importActual<typeof import('../../analytics')>('../../analytics')
  return { ...actual, track }
})

const FAQ_QUESTIONS = [
  ['Como recebo o PDF?', 'how-to-receive'],
  ['O ChatGPT é grátis. Por que comprar o PDF?', 'why-buy'],
  ['Não sei usar IA. Vou conseguir?', 'no-ai-skills'],
  ['Vai parecer robô?', 'sounds-robotic'],
  ['Isso responde sozinho aos hóspedes?', 'auto-reply'],
  ['Então são mensagens pra copiar e mandar?', 'copy-and-send'],
] as const

describe('FAQ', () => {
  afterEach(() => {
    track.mockReset()
  })

  it('answers the six questions in native disclosures, all closed', () => {
    render(<Faq />)

    const section = screen.getByRole('region', { name: 'Antes de comprar' })
    expect(within(section).getByText('Dúvidas')).toBeInTheDocument()
    const items = [...section.querySelectorAll('details')]
    expect(items.map((item) => [item.querySelector('summary')?.textContent, item.querySelector('p')?.textContent])).toEqual([
      [
        'Como recebo o PDF?',
        'Pela Hotmart, depois da confirmação do pagamento. Confere o e-mail que você informar na compra: é por ele que chega o acesso.',
      ],
      [
        'O ChatGPT é grátis. Por que comprar o PDF?',
        'Você paga pelos 12 pedidos já organizados, pelos exemplos e pelo que conferir em cada situação. O PDF te mostra o que informar pra IA e como pedir um rascunho.',
      ],
      [
        'Não sei usar IA. Vou conseguir?',
        'O primeiro pedido, o do desconto, já vem preenchido pra você ver exatamente o que colar. Você só precisa acessar o ChatGPT, trocar o que está entre [colchetes] e copiar e colar. Não precisa programar.',
      ],
      [
        'Vai parecer robô?',
        'Os pedidos já dizem pra IA escrever uma mensagem curta, em português do Brasil. Mesmo assim, o rascunho pode precisar de ajuste: você muda o que quiser antes de mandar.',
      ],
      [
        'Isso responde sozinho aos hóspedes?',
        'Não. A IA escreve um rascunho, você confere e manda. O PDF não se conecta às reservas nem guarda as informações da sua hospedagem.',
      ],
      [
        'Então são mensagens pra copiar e mandar?',
        'Não. São pedidos pra IA, um por situação. Os exemplos mostram como a resposta pode ficar. Descontos, horários e permissões continuam sendo decisão sua.',
      ],
    ])
    for (const item of items) expect(item.open).toBe(false)
  })

  it('sends opened_faq when an item opens, and nothing when it closes', async () => {
    render(<Faq />)

    for (const [question, id] of FAQ_QUESTIONS) {
      const item = screen.getByText(question).closest('details') as HTMLDetailsElement
      await userEvent.click(item.querySelector('summary') as HTMLElement)
      expect(item.open).toBe(true)
      expect(track).toHaveBeenCalledTimes(1)
      expect(track).toHaveBeenCalledWith('opened_faq', { question: id })
      track.mockClear()

      await userEvent.click(item.querySelector('summary') as HTMLElement)
      expect(item.open).toBe(false)
      expect(track).not.toHaveBeenCalled()
    }
  })
})
