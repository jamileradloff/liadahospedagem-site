import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PdfContents } from './PdfContents'

const section = () => screen.getByRole('region', { name: 'Abre na situação que você precisa resolver.' })

describe("what's in the PDF", () => {
  it('introduces the section and lists the three benefits, with decorative icons', () => {
    render(<PdfContents />)

    expect(within(section()).getByText('O que vem no PDF')).toBeInTheDocument()
    expect(
      within(section()).getByText(
        'Um pedido pra IA por situação. Você preenche com os dados da sua reserva e a IA escreve um rascunho.',
      ),
    ).toBeInTheDocument()

    const benefits = [
      ['Feito pro celular', 'Um PDF de 15 páginas pra abrir no celular, direto na situação. Cada pedido tem um botão pra copiar.'],
      ['Testado no ChatGPT grátis', 'As 12 instruções foram testadas na versão gratuita do ChatGPT. Não precisa pagar outra ferramenta.'],
      ['Você confere antes de mandar', 'A IA escreve o rascunho. Você confere os fatos, ajusta o que quiser e manda do seu jeito.'],
    ] as const
    for (const [title, text] of benefits) {
      const heading = within(section()).getByRole('heading', { level: 3, name: title })
      const card = heading.parentElement as HTMLElement
      expect(within(card).getByText(text)).toBeInTheDocument()
      expect(card.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull()
    }
  })

  it('names the four blocks of each situation, in order', () => {
    render(<PdfContents />)

    const inside = within(section()).getByRole('heading', { level: 3, name: 'Em cada situação' }).parentElement as HTMLElement
    const items = within(inside).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      '✓O que chegou: um exemplo da mensagem do hóspede',
      '✓Pede assim pra IA: o pedido, com o que preencher entre [colchetes]',
      '✓Ficou assim: um exemplo do que a IA respondeu',
      '✓Confere antes de mandar: o que olhar antes de enviar',
    ])
    for (const item of items) expect(item.querySelector('.sales-tick')).toHaveAttribute('aria-hidden', 'true')
  })

  it('lists the 12 situations as an ordered list, in the PDF order and with v2 wording', () => {
    render(<PdfContents />)

    expect(within(section()).getByRole('heading', { level: 2, name: 'As 12 situações' })).toBeInTheDocument()
    expect(within(section()).getByText('Da primeira pergunta antes da reserva à resposta da avaliação.')).toBeInTheDocument()

    const list = section().querySelector('ol.sales-modules') as HTMLOListElement
    const items = within(list).getAllByRole('listitem')
    expect(
      items.map((item) => [item.querySelector('h4')?.textContent, item.querySelector('p')?.textContent]),
    ).toEqual([
      ['01Pedido de desconto', 'Quando a pessoa pede um valor menor antes de reservar.'],
      ['02Como chegar', 'Quando perguntam como chegar ou onde estacionar.'],
      ['03Boas-vindas e chegada', 'As primeiras orientações antes da chegada, sem mandar o código real da porta.'],
      ['04Check-in mais cedo', 'Quando a pessoa pede pra entrar antes do horário.'],
      ['05Check-out mais tarde', 'Quando o hóspede pede pra ficar depois do horário de saída.'],
      ['06Pedido para levar pet', 'Quando perguntam se podem levar um animal.'],
      ['07Reclamação de barulho', 'Quando a pessoa avisa que o barulho tá atrapalhando a estadia.'],
      ['08Lembrete de check-out', 'O horário de saída e o que fazer antes de ir.'],
      ['09Pedido de avaliação', 'Depois da estadia, um convite leve pra uma avaliação sincera, sem pedir nota.'],
      ['10Avaliação de 5 estrelas', 'Pra agradecer em público.'],
      ['11Avaliação de 4 estrelas', 'Pra responder em público, com ou sem comentário.'],
      ['12Avaliação negativa', 'Pra responder em público só com o que você pode confirmar.'],
    ])
  })
})
