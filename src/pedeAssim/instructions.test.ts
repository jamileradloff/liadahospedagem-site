import { describe, expect, it } from 'vitest'
import { GROUPS, INSTRUCTIONS, findInstruction } from './instructions'

const MAPPING = [
  ['pedido-de-desconto', 'Pedido de desconto'],
  ['como-chegar', 'Como chegar'],
  ['boas-vindas-e-chegada', 'Boas-vindas e chegada'],
  ['check-in-mais-cedo', 'Check-in mais cedo'],
  ['check-out-mais-tarde', 'Check-out mais tarde'],
  ['pedido-para-levar-pet', 'Pedido para levar pet'],
  ['reclamacao-de-barulho', 'Reclamação de barulho'],
  ['lembrete-de-check-out', 'Lembrete de check-out'],
  ['pedido-de-avaliacao', 'Pedido de avaliação'],
  ['avaliacao-5-estrelas', 'Responder a uma avaliação de 5 estrelas'],
  ['avaliacao-4-estrelas', 'Responder a uma avaliação de 4 estrelas'],
  ['avaliacao-negativa', 'Responder a uma avaliação negativa'],
]

describe('Pede assim instructions', () => {
  it('lists the 12 situations in manuscript order with their PDF slugs and titles', () => {
    expect(INSTRUCTIONS.map((item) => [item.slug, item.title])).toEqual(MAPPING)
    expect(INSTRUCTIONS.map((item) => item.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('keeps the 5 groups in order', () => {
    expect(GROUPS.map((group) => [group.title, group.items.length])).toEqual([
      ['Antes de fechar a reserva', 1],
      ['Antes da chegada', 2],
      ['Pedidos e imprevistos', 4],
      ['Na saída', 2],
      ['Depois da avaliação', 3],
    ])
    expect(GROUPS.flatMap((group) => group.items)).toEqual(INSTRUCTIONS)
  })

  // pdf/pede-assim/verify.py checks each prompt against the manuscript, character for character.
  it('gives every situation its guidance and a prompt to copy', () => {
    INSTRUCTIONS.forEach((item) => {
      expect(item.when.trim()).not.toBe('')
      expect(item.fields.trim()).not.toBe('')
      expect(item.prompt.trim()).not.toBe('')
    })
  })

  it('finds an instruction by slug', () => {
    expect(findInstruction('check-out-mais-tarde')?.number).toBe(5)
    expect(findInstruction('nao-existe')).toBeUndefined()
  })
})
