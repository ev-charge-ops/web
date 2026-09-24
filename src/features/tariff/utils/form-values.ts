import type { Tariff } from '../api/get-tariff'
import type { UpdateTariffFormValues } from '../api/update-tariff'

function centsToInput(cents: number) {
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
