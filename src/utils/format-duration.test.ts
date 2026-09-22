import { describe, expect, it } from 'vitest'

import { formatDuration, minutesBetween } from './format-duration'

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(42)).toBe('42 min')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(108)).toBe('1 h 48 min')
    expect(formatDuration(120)).toBe('2 h')
  })

  it('never formats negative durations', () => {
    expect(formatDuration(-3)).toBe('0 min')
  })
})

describe('minutesBetween', () => {
  it('returns the minutes between two ISO dates', () => {
    expect(
      minutesBetween('2026-10-07T01:18:00.000Z', '2026-10-07T03:06:00.000Z'),
    ).toBe(108)
  })
})
