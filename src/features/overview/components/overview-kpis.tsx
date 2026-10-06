import { AnimatedNumber } from '@/components/ui/animated-number'
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

const integerFormatter = new Intl.NumberFormat('pt-BR')

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

type OverviewKpisProps = {
  previousMonthName: string
  units?: UnitsFigures
  previousUnits?: UnitsFigures
  visitorSessionsCount?: number
  utilityRateCents?: number
  anomaliesCount: number
  pendingReviewCount: number
}

export function OverviewKpis({
  previousMonthName,
  units,
  previousUnits,
  visitorSessionsCount,
  utilityRateCents,
  anomaliesCount,
  pendingReviewCount,
}: OverviewKpisProps) {
  const energyDelta = percentDelta(
    units?.energyKwh,
    previousUnits?.energyKwh,
    previousMonthName,
  )

  return (
    <div className={styles.grid}>
      <KpiCard
        label="Energia das unidades"
        value={
          units ? (
            <AnimatedNumber
              value={units.energyKwh}
              format={(value) => energyFormatter.format(value)}
            />
          ) : (
            '—'
          )
        }
        unit="kWh"
        hint={energyDelta?.text}
        hintTone={energyDelta?.tone}
      />
      <KpiCard
        label="Sessões"
        value={
          units ? (
            <AnimatedNumber
              value={units.sessionsCount}
              format={(value) => integerFormatter.format(Math.round(value))}
            />
          ) : (
            '—'
          )
        }
        hint={
          visitorSessionsCount === undefined
            ? undefined
            : `+ ${visitorSessionsCount} de visitantes (cartão)`
        }
      />
      <KpiCard
        label="Energia repassada"
        prefix="R$"
        value={
          units ? (
            <AnimatedNumber
              value={units.energyCents}
              format={(value) => formatCentsAmount(Math.round(value))}
            />
          ) : (
            '—'
          )
        }
        hint={
          utilityRateCents === undefined
            ? 'a custo, sem margem'
            : `a custo · ${formatCents(utilityRateCents)}/kWh`
        }
      />
      <KpiCard
        label="Anomalias"
        value={
          <AnimatedNumber
            value={anomaliesCount}
            format={(value) => integerFormatter.format(Math.round(value))}
          />
        }
        hint={
          pendingReviewCount > 0
            ? `${pendingReviewCount} para revisar`
            : 'nenhuma para revisar'
        }
        hintTone={pendingReviewCount > 0 ? 'critical' : 'default'}
      />
    </div>
  )
}
