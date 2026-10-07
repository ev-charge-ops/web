import type { components } from '@/lib/api-schema'

import { managedOrganization } from './organizations'

type OrganizationSession = components['schemas']['OrganizationSessionDto']
type SessionDetail = components['schemas']['SessionDetailResponseDto']
type SessionPage = components['schemas']['OrganizationSessionPageDto']

export function createOrganizationSession(
  overrides: Partial<OrganizationSession> = {},
): OrganizationSession {
  return {
    id: '383143a3-7107-5168-9d78-6996f7de4ab3',
    status: 'CLOSED',
    regime: 'PRIVATE',
    chargePoint: {
      id: '5b0e8c1d-2f3a-4b6c-8d7e-9f0a1b2c3d01',
      code: 'L1-01',
      name: 'Garagem L1 · Vaga 12',
    },
    driver: {
      id: 'f8f1a5c5-6d95-4b68-9cae-cd448bb7b5c1',
      name: 'Marcelo Tavares',
    },
    unitLabel: 'A · 12',
    startedAt: '2026-10-07T01:18:00.000Z',
    chargingEndedAt: '2026-10-07T03:06:00.000Z',
    endedAt: '2026-10-07T03:10:00.000Z',
    energyKwh: 12.518,
    lockedRateCents: 89,
    demandFactor: 0.8,
    energyCostCents: 1114,
    idleMinutes: 0,
    idleFeeCents: 0,
    totalCents: 1114,
    anomalyScore: 0.21,
    isAnomaly: false,
    ...overrides,
  }
}

export const flaggedSession = createOrganizationSession({
  id: '760e2fb8-0d3e-561d-8a86-246dfffb5cad',
  chargePoint: {
    id: '5b0e8c1d-2f3a-4b6c-8d7e-9f0a1b2c3d02',
    code: 'L1-02',
    name: 'Garagem L1 · Vaga 13',
  },
  driver: { id: 'f07aceea-8e8e-4a0f-bc70-27a3da794dfc', name: 'Verônica Alencar' },
  unitLabel: 'B · 23',
  startedAt: '2026-10-05T06:23:00.000Z',
  chargingEndedAt: '2026-10-05T07:22:00.000Z',
  endedAt: '2026-10-05T09:43:00.000Z',
  energyKwh: 38.3,
  energyCostCents: 3409,
  idleMinutes: 131,
  idleFeeCents: 3000,
  totalCents: 6409,
  anomalyScore: 0.9133,
  isAnomaly: true,
})

export const organizationSessions: OrganizationSession[] = [
  createOrganizationSession(),
  flaggedSession,
  createOrganizationSession({
    id: 'e4c1d27d-c4cc-5cdc-936e-027687eea2ce',
    status: 'ACTIVE',
    driver: { id: 'ba1a23c0-2891-4a6a-968d-ecddd21f989a', name: 'Diego Lima' },
    unitLabel: 'B · 42',
    startedAt: '2026-10-07T12:00:00.000Z',
    chargingEndedAt: null,
    endedAt: null,
    energyKwh: 3.2,
    energyCostCents: 285,
    totalCents: 285,
    anomalyScore: null,
    isAnomaly: null,
  }),
]

export function createSessionPage(
  items: OrganizationSession[] = organizationSessions,
  overrides: Partial<SessionPage> = {},
): SessionPage {
  return { items, total: items.length, page: 1, pageSize: 50, ...overrides }
}

export function createSessionDetail(
  session: OrganizationSession,
  overrides: Partial<SessionDetail> = {},
): SessionDetail {
  return {
    id: session.id,
    status: session.status,
    chargePoint: session.chargePoint,
    organizationId: managedOrganization.id,
    unitLabel: session.unitLabel,
    regime: session.regime,
    limit: { type: 'FULL', energyKwh: null, amountCents: null },
    targetEnergyKwh: null,
    startedAt: session.startedAt,
    chargingEndedAt: session.chargingEndedAt,
    graceEndsAt: null,
    endedAt: session.endedAt,
    energyKwh: session.energyKwh,
    powerKw: 0,
    allocatedPowerKw: 7,
    socPercent: 100,
    lockedRateCents: session.lockedRateCents,
    demandFactor: session.demandFactor,
    demandFactorSource: 'MODEL',
    demandModelVersion: 'v1',
    energyCostCents: session.energyCostCents,
    gracePeriodMinutes: 10,
    idleFeeCentsPerMinute: 25,
    idleFeeCapCents: 3000,
    idleMinutes: session.idleMinutes,
    idleFeeCents: session.idleFeeCents,
    totalCents: session.totalCents,
    anomalyScore: session.anomalyScore,
    isAnomaly: session.isAnomaly,
    simulationSpeed: 1,
    payment: null,
    readings: [],
    ...overrides,
  }
}
