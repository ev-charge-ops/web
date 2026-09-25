import { describe, expect, it } from 'vitest'

import { getContentDispositionFilename } from './content-disposition'

describe('getContentDispositionFilename', () => {
  it('reads a quoted filename', () => {
    expect(
      getContentDispositionFilename('attachment; filename="rateio-2026-10.csv"'),
    ).toBe('rateio-2026-10.csv')
  })

  it('reads an unquoted filename', () => {
    expect(getContentDispositionFilename('attachment; filename=rateio.csv')).toBe(
      'rateio.csv',
    )
  })

  it('prefers the encoded filename', () => {
    expect(
      getContentDispositionFilename(
        `attachment; filename="rateio.csv"; filename*=UTF-8''rateio-jardim-%C3%A1urea.csv`,
      ),
    ).toBe('rateio-jardim-áurea.csv')
  })

  it('returns null without a filename', () => {
    expect(getContentDispositionFilename(null)).toBeNull()
    expect(getContentDispositionFilename('attachment')).toBeNull()
    expect(getContentDispositionFilename('attachment; filename=""')).toBeNull()
  })
})
