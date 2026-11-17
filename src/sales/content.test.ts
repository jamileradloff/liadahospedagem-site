import { describe, expect, it } from 'vitest'
import { INSTRUCTIONS } from '../pedeAssim/instructions'
import { CHECKOUT_LIVE, EXAMPLE, HOTMART_CHECKOUT_URL } from './content'

describe('example instruction', () => {
  it('is situation 4 of the PDF, character for character', () => {
    const situation = INSTRUCTIONS[3]
    expect(situation?.slug).toBe('check-in-mais-cedo')
    expect(EXAMPLE.instruction).toBe(situation?.prompt)
  })
})

describe('checkout', () => {
  it('is open, so the buy buttons go to Hotmart', () => {
    expect(CHECKOUT_LIVE).toBe(true)
  })

  it('points at the exact Hotmart checkout link, without parameters', () => {
    expect(HOTMART_CHECKOUT_URL).toBe('https://pay.hotmart.com/T108525255F')
  })
})
