import { formatCents, formatCentsAmount } from '@/utils/format-currency'

import { KpiCard, type KpiTone } from './kpi-card'
import styles from './kpi-card.module.css'

const energyFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
})

const countFormatter = new Intl.NumberFormat('pt-BR', {
  signDisplay: 'exceptZero',
})

export type UnitsFigures = {
  energyKwh: number
  sessionsCount: number
  energyCents: number
}

type Delta = { text: string; tone: KpiTone }

function percentDelta(
  current: number | undefined,
  previous: number | undefined,
  previousMonthName: string,
): Delta | undefined {
  if (current === undefined || !previous) return undefined
  const change = (current - previous) / previous
  return {
    text: `${percentFormatter.format(change)} vs. ${previousMonthName}`,
    tone: Math.round(change * 100) > 0 ? 'positive' : 'default',
  }
}

function countDelta(
  current: number,
  previous: number | undefined,
  previousMonthName: string,
): Delta | undefined {
  if (previous === undefined) return undefined
  const change = current - previous
  return {
    text: `${countFormatter.format(change)} vs. ${previousMonthName}`,
    tone: change > 0 ? 'critical' : 'default',
  }
}

type OverviewKpisProps = {
  previousMonthName: string
  units?: UnitsFigures
  previousUnits?: UnitsFigures
  visitorSessionsCount?: number
  utilityRateCents?: number
  anomaliesCount: number
  previousAnomaliesCount?: number
  pendingReviewCount: number
}

export function OverviewKpis({
  previousMonthName,
  units,
  previousUnits,
  visitorSessionsCount,
  utilityRateCents,
  anomaliesCount,
  previousAnomaliesCount,
  pendingReviewCount,
}: OverviewKpisProps) {
  const energyDelta = percentDelta(
    units?.energyKwh,
    previousUnits?.energyKwh,
    previousMonthName,
  )
  const sessionsDelta = percentDelta(
    units?.sessionsCount,
    previousUnits?.sessionsCount,
    previousMonthName,
  )
  const costDelta = percentDelta(
    units?.energyCents,
    previousUnits?.energyCents,
    previousMonthName,
  )
  const anomaliesDelta = countDelta(
    anomaliesCount,
    previousAnomaliesCount,
    previousMonthName,
  )

  return (
    <div className={styles.grid}>
      <KpiCard
        label="Energia das unidades"
        value={units ? energyFormatter.format(units.energyKwh) : '—'}
        unit="kWh"
        delta={energyDelta?.text}
        deltaTone={energyDelta?.tone}
      />
      <KpiCard
        label="Sessões"
        value={units ? String(units.sessionsCount) : '—'}
        hint={
          visitorSessionsCount === undefined
            ? undefined
            : `+ ${visitorSessionsCount} de visitantes (cartão)`
        }
        delta={sessionsDelta?.text}
        deltaTone={sessionsDelta?.tone}
      />
      <KpiCard
        label="Energia repassada"
        prefix="R$"
        value={units ? formatCentsAmount(units.energyCents) : '—'}
        hint={
          utilityRateCents === undefined
            ? 'a custo, sem margem'
            : `a custo · ${formatCents(utilityRateCents)}/kWh`
        }
        delta={costDelta?.text}
        deltaTone={costDelta?.tone}
      />
      <KpiCard
        label="Anomalias"
        value={String(anomaliesCount)}
        hint={
          pendingReviewCount > 0
            ? `${pendingReviewCount} para revisar`
            : 'nenhuma para revisar'
        }
        hintTone={pendingReviewCount > 0 ? 'critical' : 'default'}
        delta={anomaliesDelta?.text}
        deltaTone={anomaliesDelta?.tone}
      />
    </div>
  )
}
