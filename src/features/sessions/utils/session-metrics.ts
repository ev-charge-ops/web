import { minutesBetween } from '@/utils/format-duration'

import type { OrganizationSessionDetail } from '../api/get-organization-session'

type SessionTimes = Pick<
  OrganizationSessionDetail,
  'startedAt' | 'chargingEndedAt' | 'endedAt'
>

export function getChargingMinutes(
  session: SessionTimes,
  now: Date = new Date(),
) {
  const end = session.chargingEndedAt ?? session.endedAt ?? now.toISOString()
  return minutesBetween(session.startedAt, end)
}

export function getAveragePowerKw(
  session: SessionTimes & Pick<OrganizationSessionDetail, 'energyKwh'>,
) {
  const hours = getChargingMinutes(session) / 60
  return hours > 0 ? session.energyKwh / hours : 0
}
