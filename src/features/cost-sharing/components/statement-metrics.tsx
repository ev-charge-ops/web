import { MetricTile } from '@/components/ui/metric-tile'
import { formatCents } from '@/utils/format-currency'

import type { MonthlyStatement } from '../api/get-statement'
import styles from './statement-metrics.module.css'

const energyFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

type StatementMetricsProps = {
  statement: MonthlyStatement
}

export function StatementMetrics({ statement }: StatementMetricsProps) {
  const { totals } = statement
  const unitsWithConsumption = statement.lines.filter(
    (line) => line.energyKwh > 0,
  ).length
  const unitsWithIdleFee = statement.lines.filter(
    (line) => line.idleFeeCents > 0,
  ).length

  return (
    <div className={styles.metrics}>
      <MetricTile
        eyebrow="Total a ratear"
        value={formatCents(totals.totalCents)}
        hint={`${totals.unitsCount} unidades no rateio`}
      />
      <MetricTile
        eyebrow="Energia medida"
        value={energyFormatter.format(totals.energyKwh)}
        unit="kWh"
        hint={`${formatCents(totals.energyCents)} · ${unitsWithConsumption} unidades com consumo`}
      />
      <MetricTile
        eyebrow="Taxa de acesso"
        value={formatCents(totals.accessFeeCents)}
        hint={`${formatCents(statement.accessFeeCents)} por unidade com veículo`}
      />
      <MetricTile
        eyebrow="Ocupação"
        value={formatCents(totals.idleFeeCents)}
        tone="demand"
        hint={`${unitsWithIdleFee} unidades com minutos excedentes`}
      />
    </div>
  )
}
