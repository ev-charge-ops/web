import { describe, expect, it } from 'vitest'

import { getInitials } from './initials'

describe('getInitials', () => {
  it.each([
    ['Residencial Aclimação', 'RA'],
    ['Condomínio Jardim Paulista', 'CJ'],
    ['Edifício da Vila Mariana', 'EV'],
    ['  ana  souza ', 'AS'],
    ['Aurora', 'AU'],
    ['', ''],
  ])('turns %j into %j', (name, initials) => {
    expect(getInitials(name)).toBe(initials)
  })
})
