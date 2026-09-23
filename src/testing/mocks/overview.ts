import type { components } from '@/lib/api-schema'

type Overview = components['schemas']['OrganizationOverviewResponseDto']

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
    ...overrides,
  }
}
