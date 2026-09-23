import { MetricTile } from '@/components/ui/metric-tile'
import { formatCents } from '@/utils/format-currency'
import { formatPercent } from '@/utils/format-percent'
import { formatPower } from '@/utils/format-power'

import type { OrganizationOverview } from '../api/get-overview'
import styles from './overview-metrics.module.css'

const energyFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

type OverviewMetricsProps = {
  overview: OrganizationOverview
}

export function OverviewMetrics({ overview }: OverviewMetricsProps) {
  const { capacity } = overview
  const averageEnergy =
    overview.unitsWithConsumption > 0
      ? overview.energyKwh / overview.unitsWithConsumption
      : 0

  return (
    <div className={styles.metrics}>
      <MetricTile
        eyebrow="Energia no mês"
        value={energyFormatter.format(overview.energyKwh)}
        unit="kWh"
        hint={`${overview.unitsWithConsumption} unidades · média de ${energyFormatter.format(averageEnergy)} kWh`}
      />
      <MetricTile
        eyebrow="Valor a ratear"
        value={formatCents(overview.costSharingTotalCents)}
        hint={`${formatCents(overview.commercialRevenueCents)} de visitantes no cartão`}
      />
      <MetricTile
        eyebrow="Sessões no mês"
        value={String(overview.sessionsCount)}
        hint={`${overview.unitsWithVehicle} unidades com veículo`}
      />
      <MetricTile
        eyebrow="Sessões ativas"
        value={String(overview.activeSessionsCount)}
        tone={overview.activeSessionsCount > 0 ? 'charging' : 'default'}
        hint={
          overview.activeSessionsCount > 0
            ? `${formatPower(capacity.chargingDemandKw)} carregando agora`
            : 'Nenhuma recarga em andamento'
        }
      />
      <MetricTile
        eyebrow="Uso da capacidade"
        value={formatPercent(capacity.utilizationPercent)}
        tone={capacity.utilizationPercent >= 80 ? 'fault' : 'demand'}
        hint={`${formatPower(capacity.currentDemandKw)} de ${formatPower(capacity.contractedDemandKw)} agora`}
      />
    </div>
  )
}
