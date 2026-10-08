import type { components } from '@/lib/api-schema'

import { managedOrganization } from './organizations'

type ChargePoint = components['schemas']['ChargePointResponseDto']
type ChargePointPricing = components['schemas']['ChargePointPricingDto']

export function createPricing(
  overrides: Partial<ChargePointPricing> = {},
): ChargePointPricing {
  return {
    pricePerKwhCents: 89,
    utilityRateCents: 89,
    baseRateCents: null,
    demandFactor: 0.8,
    demandLevel: 'OFF_PEAK',
    demandFactorSource: 'MODEL',
    demandModelVersion: 'v1',
    demandFactorApplied: false,
    idleFeeCentsPerMinute: 25,
    idleFeeCapCents: 3000,
    gracePeriodMinutes: 10,
    ...overrides,
  }
}

export function createChargePoint(
  overrides: Partial<ChargePoint> = {},
): ChargePoint {
  return {
    id: '5b0e8c1d-2f3a-4b6c-8d7e-9f0a1b2c3d01',
    organizationId: managedOrganization.id,
    organizationName: managedOrganization.name,
    code: 'L1-01',
    name: 'Garagem L1 · Vaga 12',
    type: 'PRIVATE',
    latitude: -23.56905,
    longitude: -46.63145,
    maxPowerKw: 7,
    photoUrl: 'https://app.evchargeops.com.br/media/points/garage-a.webp',
    status: 'AVAILABLE',
    isMember: true,
    charger: {
      id: '5b0e8c1d-2f3a-4b6c-8d7e-9f0a1b2c3e01',
      vendor: 'GoodWe HCA G2',
      serialNumber: 'GW-HCA-G2-0001',
      connector: 'TYPE_2',
    },
    pricing: createPricing(),
    queueLength: 0,
    reservedUntil: null,
    myQueueEntry: null,
    ...overrides,
  }
}

export const chargePoints: ChargePoint[] = [
  createChargePoint(),
  createChargePoint({
    id: '5b0e8c1d-2f3a-4b6c-8d7e-9f0a1b2c3d02',
    code: 'L1-02',
    name: 'Garagem L1 · Vaga 13',
    status: 'CHARGING',
    charger: {
      id: '5b0e8c1d-2f3a-4b6c-8d7e-9f0a1b2c3e02',
      vendor: 'GoodWe HCA G2',
      serialNumber: 'GW-HCA-G2-0002',
      connector: 'TYPE_2',
    },
  }),
  createChargePoint({
    id: '5b0e8c1d-2f3a-4b6c-8d7e-9f0a1b2c3d03',
    code: 'L2-01',
    name: 'Garagem L2 · Visitantes',
    type: 'COMMERCIAL',
    maxPowerKw: 22,
    charger: null,
    pricing: createPricing({
      pricePerKwhCents: 151,
      baseRateCents: 189,
      demandFactorApplied: true,
    }),
  }),
  createChargePoint({
    id: '0c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
    organizationId: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    organizationName: 'Shopping Paulista',
    code: 'SP-01',
    name: 'Estacionamento público',
    type: 'COMMERCIAL',
    isMember: false,
  }),
]
