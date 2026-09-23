import { TriangleAlert } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Meter } from '@/components/ui/meter'
import { cn } from '@/utils/cn'
import { formatPercent } from '@/utils/format-percent'
import { formatPower } from '@/utils/format-power'

import type { SiteCapacity } from '../api/get-overview'
import styles from './capacity-card.module.css'

const warningPercent = 80

type CapacityCardProps = {
  capacity: SiteCapacity
}

export function CapacityCard({ capacity }: CapacityCardProps) {
  const isNearLimit = capacity.utilizationPercent >= warningPercent

  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>Capacidade elétrica agora</h2>

      <div>
        <div className={styles.row}>
          <span className={styles.label}>Demanda do prédio</span>
          <span className={cn(styles.value, isNearLimit && styles.over)}>
            {formatPower(capacity.currentDemandKw)} de{' '}
            {formatPower(capacity.contractedDemandKw)}
          </span>
        </div>
        <Meter
          label="Demanda atual sobre o limite contratado"
          value={capacity.currentDemandKw}
          max={capacity.contractedDemandKw}
          tone={isNearLimit ? 'over' : 'demand'}
        />
        <p className={styles.note}>
          {formatPercent(capacity.utilizationPercent)} do limite contratado. O
          balanceamento reduz a potência dos pontos antes de chegar ao limite.
        </p>
      </div>

      <div>
        <div className={styles.row}>
          <span className={styles.label}>Pico médio diário</span>
          <span className={styles.value}>
            {formatPower(capacity.averagePeakDemandKw)} ·{' '}
            {formatPercent(capacity.averagePeakUtilizationPercent)}
          </span>
        </div>
        <Meter
          label="Pico médio diário sobre o limite contratado"
          value={capacity.averagePeakDemandKw}
          max={capacity.contractedDemandKw}
          tone={capacity.upgradeRecommended ? 'over' : 'energy'}
        />
      </div>

      <dl className={styles.breakdown}>
        <div>
          <dt>Limite contratado</dt>
          <dd>{formatPower(capacity.contractedDemandKw)}</dd>
        </div>
        <div>
          <dt>Reserva das áreas comuns</dt>
          <dd>{formatPower(capacity.commonAreaReserveKw)}</dd>
        </div>
        <div>
          <dt>Recargas em andamento</dt>
          <dd>{formatPower(capacity.chargingDemandKw)}</dd>
        </div>
      </dl>

      {capacity.upgradeRecommended ? (
        <div className={styles.warning}>
          <TriangleAlert size={16} strokeWidth={2} aria-hidden />
          <span>
            O pico médio passa de {warningPercent}% do limite. Avalie aumentar a
            demanda contratada.
          </span>
        </div>
      ) : null}
    </Card>
  )
}
