import { Card } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'
import { formatDemandFactor, formatDemandSource } from '@/utils/demand'
import { formatCents } from '@/utils/format-currency'
import { formatPower } from '@/utils/format-power'

import type { ChargePoint } from '../api/get-charge-points'
import {
  chargePointStatusLabels,
  chargePointStatusTones,
  chargePointTypeLabels,
  connectorLabels,
  demandLevelLabels,
  demandLevelTones,
} from '../utils/labels'
import styles from './charge-point-card.module.css'

type ChargePointCardProps = {
  chargePoint: ChargePoint
}

export function ChargePointCard({ chargePoint }: ChargePointCardProps) {
  const { charger, pricing } = chargePoint

  const lines = [
    { label: 'Uso', value: chargePointTypeLabels[chargePoint.type] },
    { label: 'Potência máxima', value: formatPower(chargePoint.maxPowerKw) },
    { label: 'Carregador', value: charger?.vendor ?? 'Não vinculado' },
    ...(charger
      ? [
          { label: 'Número de série', value: charger.serialNumber },
          { label: 'Conector', value: connectorLabels[charger.connector] },
        ]
      : []),
  ]

  return (
    <Card
      role="article"
      className={styles.card}
      aria-labelledby={`point-${chargePoint.id}`}
    >
      <div className={styles.head}>
        <div className={styles.identity}>
          <h3 id={`point-${chargePoint.id}`} className={styles.name}>
            {chargePoint.name}
          </h3>
          <span className={styles.code}>{chargePoint.code}</span>
        </div>
        <StatusPill tone={chargePointStatusTones[chargePoint.status]} withDot>
          {chargePointStatusLabels[chargePoint.status]}
        </StatusPill>
      </div>

      <dl className={styles.lines}>
        {lines.map(({ label, value }) => (
          <div className={styles.line} key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.pricing}>
        {pricing ? (
          <>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Preço agora</span>
              <span className={styles.price}>
                {formatCents(pricing.pricePerKwhCents)}
                <span className={styles.unit}> / kWh</span>
              </span>
            </div>
            <div className={styles.demand}>
              <StatusPill tone={demandLevelTones[pricing.demandLevel]}>
                {demandLevelLabels[pricing.demandLevel]} ·{' '}
                {formatDemandFactor(pricing.demandFactor)}
              </StatusPill>
              <span className={styles.source}>
                {formatDemandSource(
                  pricing.demandFactorSource,
                  pricing.demandModelVersion,
                )}
                {pricing.demandFactorApplied ? '' : ' · informativo'}
              </span>
            </div>
          </>
        ) : (
          <span className={styles.noPricing}>Sem tarifa configurada</span>
        )}
      </div>
    </Card>
  )
}
