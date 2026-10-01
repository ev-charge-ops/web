import type { components } from '@/lib/api-schema'
import { formatDayMonth } from '@/utils/format-date'
import { formatDuration, minutesBetween } from '@/utils/format-duration'
import { formatEnergy } from '@/utils/format-energy'

import { formatAnomalyScore } from './labels'

export type RecentAnomaly = components['schemas']['RecentAnomalyDto']

export function getAnomalyTitle(anomaly: RecentAnomaly) {
  const who = anomaly.unitLabel ? `unidade ${anomaly.unitLabel}` : 'visitante'
  return `Sessão atípica · ${who}`
}

export function getAnomalyMeta(anomaly: RecentAnomaly) {
  const energy = formatEnergy(anomaly.energyKwh)
  const duration = anomaly.endedAt
    ? ` em ${formatDuration(minutesBetween(anomaly.startedAt, anomaly.endedAt))}`
    : ''
  const idle =
    anomaly.idleMinutes > 0 ? `${formatDuration(anomaly.idleMinutes)} de ocupação` : null
  const score =
    anomaly.anomalyScore === null
      ? null
      : `score ${formatAnomalyScore(anomaly.anomalyScore)}${anomaly.anomalyModelVersion ? '' : ' (regra)'}`
  return [
    anomaly.chargePoint.code,
    formatDayMonth(anomaly.startedAt),
    `${energy}${duration}`,
    idle,
    score,
  ]
    .filter(Boolean)
    .join(' · ')
}
