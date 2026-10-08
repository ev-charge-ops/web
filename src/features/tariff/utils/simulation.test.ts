import { describe, expect, it } from 'vitest'

import {
  idleFeeCents,
  sessionEnergyCents,
  visitorRateCents,
} from './simulation'

describe('tariff simulation', () => {
  it('prices the energy and the visitor rate like the API', () => {
    expect(sessionEnergyCents(15, 89)).toBe(1335)
    expect(visitorRateCents(189, 89, 1.12)).toBe(212)
    expect(visitorRateCents(null, 89, 1.12)).toBe(100)
  })

  it('charges the idle minutes after the grace period up to the cap', () => {
    expect(idleFeeCents(20, 10, 25, 3000)).toBe(250)
    expect(idleFeeCents(5, 10, 25, 3000)).toBe(0)
    expect(idleFeeCents(400, 10, 25, 3000)).toBe(3000)
  })
})
