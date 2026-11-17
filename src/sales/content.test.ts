import { describe, expect, it } from 'vitest'
import { CHECKOUT_LIVE, HOTMART_CHECKOUT_URL } from './content'

describe('checkout', () => {
  it('stays pending until Hotmart approves the product', () => {
    expect(CHECKOUT_LIVE).toBe(false)
  })

  it('points at the exact Hotmart checkout link, without parameters', () => {
    expect(HOTMART_CHECKOUT_URL).toBe('https://pay.hotmart.com/T108525255F')
  })
})
