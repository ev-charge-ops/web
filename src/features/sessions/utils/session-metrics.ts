import { minutesBetween } from '@/utils/format-duration'

import type { SessionDetail } from '../api/get-session'

type SessionTimes = Pick<
  SessionDetail,
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
  session: SessionTimes & Pick<SessionDetail, 'energyKwh'>,
) {
  const hours = getChargingMinutes(session) / 60
  return hours > 0 ? session.energyKwh / hours : 0
}
