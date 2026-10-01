import { describe, expect, it } from 'vitest'

import { formatDate, formatDateTime, formatDayMonth, formatTime } from './format-date'

describe('formatDate', () => {
  it('formats ISO dates in the São Paulo time zone', () => {
    expect(formatDate('2026-10-07T12:00:00.000Z')).toBe('07/10/2026')
    expect(formatDate('2026-10-07T01:00:00.000Z')).toBe('06/10/2026')
  })

  it('accepts Date instances', () => {
    expect(formatDate(new Date('2026-01-15T15:00:00.000Z'))).toBe('15/01/2026')
  })
})

describe('formatDayMonth', () => {
  it('formats day and month in the São Paulo time zone', () => {
    expect(formatDayMonth('2026-09-24T02:00:00.000Z')).toBe('23/09')
  })
})

describe('formatDateTime', () => {
  it('formats day, month and time in the São Paulo time zone', () => {
    expect(formatDateTime('2026-10-07T01:18:00.000Z')).toBe('06/10 22:18')
  })
})

describe('formatTime', () => {
  it('formats the time in the São Paulo time zone', () => {
    expect(formatTime('2026-10-07T03:06:00.000Z')).toBe('00:06')
  })
})
