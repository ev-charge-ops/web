import { describe, expect, it } from 'vitest'

import { formatEnergy } from './format-energy'

describe('formatEnergy', () => {
  it('formats kWh using pt-BR separators', () => {
    expect(formatEnergy(1234.5)).toBe('1.234,5 kWh')
  })

  it('omits trailing decimals for integers', () => {
    expect(formatEnergy(42)).toBe('42 kWh')
  })

  it('rounds to one decimal place by default', () => {
    expect(formatEnergy(12.345)).toBe('12,3 kWh')
  })

  it('accepts a custom number of fraction digits', () => {
    expect(formatEnergy(12.345, { maximumFractionDigits: 2 })).toBe(
      '12,35 kWh',
    )
  })
})
