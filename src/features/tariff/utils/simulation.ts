export const simulatedEnergyKwh = 15
export const simulatedIdleMinutes = 20

export function sessionEnergyCents(energyKwh: number, rateCents: number) {
  return Math.round(energyKwh * rateCents)
}

export function visitorRateCents(
  baseRateCents: number | null,
  utilityRateCents: number,
  demandFactor: number,
) {
  return Math.round((baseRateCents ?? utilityRateCents) * demandFactor)
}

export function chargedIdleMinutes(idleMinutes: number, graceMinutes: number) {
  return Math.max(0, idleMinutes - graceMinutes)
}

export function idleFeeCents(
  idleMinutes: number,
  graceMinutes: number,
  centsPerMinute: number,
  capCents: number,
) {
  return Math.min(
    capCents,
    chargedIdleMinutes(idleMinutes, graceMinutes) * centsPerMinute,
  )
}
