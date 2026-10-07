import type { components } from '@/lib/api-schema'

import { managedOrganization } from './organizations'

type Tariff = components['schemas']['TariffResponseDto']

export function createTariff(overrides: Partial<Tariff> = {}): Tariff {
  return {
    id: '5b0e8c1d-2f3a-4b6c-8d7e-9f0a1b2c3d00',
    organizationId: managedOrganization.id,
    utilityRateCents: 89,
    baseRateCents: 189,
    accessFeeCents: 3500,
    idleFeeCentsPerMinute: 25,
    idleFeeCapCents: 3000,
    gracePeriodMinutes: 10,
    validFrom: '2026-01-01T03:00:00.000Z',
    ...overrides,
  }
}
