import { describe, expect, it } from 'vitest'

import {
  formatMonth,
  formatMonthName,
  formatMonthTitle,
  formatShortMonth,
  getCurrentMonth,
  getDaysInMonth,
  getMonthLastDay,
  isMonth,
  shiftMonth,
} from './month'

describe('month utils', () => {
  it('reads the current month in the São Paulo time zone', () => {
    expect(getCurrentMonth(new Date('2026-11-01T02:00:00.000Z'))).toBe('2026-10')
    expect(getCurrentMonth(new Date('2026-11-01T03:00:00.000Z'))).toBe('2026-11')
  })

  it('shifts months across years', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
  })

  it('formats months in Portuguese', () => {
    expect(formatMonth('2026-10')).toBe('outubro de 2026')
    expect(formatMonthName('2026-08')).toBe('agosto')
    expect(formatMonthTitle('2026-09')).toBe('Setembro de 2026')
    expect(formatShortMonth('2026-09')).toBe('Set 2026')
  })

  it('reads the last day of a month as day and month', () => {
    expect(getMonthLastDay('2026-09')).toBe('30/09')
    expect(getMonthLastDay('2028-02')).toBe('29/02')
    expect(getDaysInMonth('2026-02')).toBe(28)
  })

  it('validates the month format', () => {
    expect(isMonth('2026-08')).toBe(true)
    expect(isMonth('2026-13')).toBe(false)
    expect(isMonth(null)).toBe(false)
  })
})
