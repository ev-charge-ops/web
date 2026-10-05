import type { Tariff } from '../api/get-tariff'
import type { UpdateTariffFormValues } from '../api/update-tariff'

export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',')
}

export function toTariffFormValues(tariff: Tariff): UpdateTariffFormValues {
  return {
    utilityRate: centsToInput(tariff.utilityRateCents),
    baseRate:
      tariff.baseRateCents === null ? '' : centsToInput(tariff.baseRateCents),
    accessFee: centsToInput(tariff.accessFeeCents),
    idleFeePerMinute: centsToInput(tariff.idleFeeCentsPerMinute),
    idleFeeCap: centsToInput(tariff.idleFeeCapCents),
    gracePeriodMinutes: String(tariff.gracePeriodMinutes),
  }
}

const moneyInputPattern = /^\d{1,6}([.,]\d{1,2})?$/

export function parseMoneyInput(value: string) {
  const trimmed = value.trim()
  if (!moneyInputPattern.test(trimmed)) return null
  return Math.round(Number(trimmed.replace(',', '.')) * 100)
}

export function parseMinutesInput(value: string) {
  const trimmed = value.trim()
  return /^\d{1,3}$/.test(trimmed) ? Number(trimmed) : null
}
