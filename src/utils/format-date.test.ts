import { describe, expect, it } from 'vitest'

import { formatDate } from './format-date'

describe('formatDate', () => {
  it('formats ISO dates in the São Paulo time zone', () => {
    expect(formatDate('2026-10-07T12:00:00.000Z')).toBe('07/10/2026')
    expect(formatDate('2026-10-07T01:00:00.000Z')).toBe('06/10/2026')
  })

  it('accepts Date instances', () => {
    expect(formatDate(new Date('2026-01-15T15:00:00.000Z'))).toBe('15/01/2026')
  })
})
