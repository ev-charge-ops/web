import type { components } from '@/lib/api-schema'

import { chargePoints } from './charge-points'
import { managedOrganization } from './organizations'
import { flaggedSession } from './sessions'

type Overview = components['schemas']['OrganizationOverviewResponseDto']
type RecentAnomaly = components['schemas']['RecentAnomalyDto']
type OverviewChargePoint = components['schemas']['OverviewChargePointDto']

export function createRecentAnomaly(
  overrides: Partial<RecentAnomaly> = {},
): RecentAnomaly {
  return {
    sessionId: flaggedSession.id,
    status: flaggedSession.status,
    regime: flaggedSession.regime,
    chargePoint: flaggedSession.chargePoint,
    driver: flaggedSession.driver,
    unitLabel: flaggedSession.unitLabel,
    startedAt: flaggedSession.startedAt,
    endedAt: flaggedSession.endedAt,
    energyKwh: flaggedSession.energyKwh,
    idleMinutes: flaggedSession.idleMinutes,
    totalCents: flaggedSession.totalCents,
    anomalyScore: flaggedSession.anomalyScore,
    anomalyModelVersion: 'v1',
    anomalyReviewStatus: flaggedSession.anomalyReviewStatus,
    anomalyReviewNote: flaggedSession.anomalyReviewNote,
    anomalyReviewedAt: flaggedSession.anomalyReviewedAt,
    anomalyReviewedById: flaggedSession.anomalyReviewedById,
    ...overrides,
  }
}

export const overviewChargePoints: OverviewChargePoint[] = chargePoints
  .filter((point) => point.organizationId === managedOrganization.id)
  .map(({ id, code, name, type, maxPowerKw, photoUrl, status, pricing }) => ({
    id,
    code,
    name,
    type,
    maxPowerKw,
    photoUrl,
    status,
    pricing,
  }))

export function createOverview(overrides: Partial<Overview> = {}): Overview {
  return {
    month: '2026-10',
    energyKwh: 1284.6,
    sessionsCount: 102,
    activeSessionsCount: 2,
    costSharingTotalCents: 198734,
    commercialRevenueCents: 45210,
    unitsWithVehicle: 21,
    unitsWithConsumption: 18,
    capacity: {
      contractedDemandKw: 75,
      commonAreaReserveKw: 11.5,
      chargingDemandKw: 14,
      currentDemandKw: 25.5,
      utilizationPercent: 34,
      averagePeakDemandKw: 40.2,
      averagePeakUtilizationPercent: 53.6,
      upgradeRecommended: false,
    },
    energyByWeek: [
      { week: 1, energyKwh: 218.4 },
      { week: 2, energyKwh: 372.8 },
      { week: 3, energyKwh: 301.2 },
      { week: 4, energyKwh: 288.1 },
      { week: 5, energyKwh: 104.1 },
    ],
    anomaliesCount: 3,
    anomaliesPendingReviewCount: 1,
    recentAnomalies: [createRecentAnomaly()],
    chargePoints: overviewChargePoints,
    ...overrides,
  }
}
