import { describe, expect, it } from 'vitest'

import { formatCurrency } from './format-currency'

const normalize = (value: string) => value.replace(/\s/g, ' ')

describe('formatCurrency', () => {
  it('formats values as BRL using pt-BR separators', () => {
    expect(normalize(formatCurrency(1234.5))).toBe('R$ 1.234,50')
  })

  it('formats zero', () => {
    expect(normalize(formatCurrency(0))).toBe('R$ 0,00')
  })

  it('rounds to two decimal places', () => {
    expect(normalize(formatCurrency(10.456))).toBe('R$ 10,46')
  })

  it('formats negative values', () => {
    expect(normalize(formatCurrency(-89.9))).toBe('-R$ 89,90')
  })
})
