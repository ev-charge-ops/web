import { Sparkles } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'
import { formatDemandFactor, formatDemandSource } from '@/utils/demand'
import { formatCents } from '@/utils/format-currency'

import type { ChargePoint } from '../api/get-charge-points'
import { demandLevelLabels, demandLevelTones } from '../utils/labels'
import styles from './dynamic-price-card.module.css'

export type PricedChargePoint = Pick<ChargePoint, 'id' | 'code' | 'name' | 'pricing'>

type DynamicPriceCardProps = {
  chargePoints: PricedChargePoint[]
}

export function DynamicPriceCard({ chargePoints }: DynamicPriceCardProps) {
  const pricedPoints = chargePoints.flatMap((point) =>
    point.pricing ? [{ ...point, pricing: point.pricing }] : [],
  )
  const reference =
    pricedPoints.find((point) => point.pricing.demandFactorApplied) ??
    pricedPoints[0]

  return (
    <Card flush>
      <div className={styles.head}>
        <h2 className={styles.title}>Preço dinâmico agora</h2>
        {reference ? (
          <StatusPill tone={demandLevelTones[reference.pricing.demandLevel]}>
            {demandLevelLabels[reference.pricing.demandLevel]}
          </StatusPill>
        ) : null}
      </div>

      {!reference ? (
        <p className={styles.empty}>
          Nenhum ponto com tarifa configurada neste condomínio.
        </p>
      ) : (
        <>
          <div className={styles.factor}>
            <Sparkles size={18} strokeWidth={2} aria-hidden className={styles.icon} />
            <div className={styles.factorBody}>
              <div className={styles.factorValue}>
                Fator de demanda {formatDemandFactor(reference.pricing.demandFactor)}
              </div>
              <div className={styles.factorSource}>
                {formatDemandSource(
                  reference.pricing.demandFactorSource,
                  reference.pricing.demandModelVersion,
                )}
              </div>
            </div>
          </div>
          <ul className={styles.points} aria-label="Preço por ponto">
            {pricedPoints.map((point) => (
              <li className={styles.point} key={point.id}>
                <div className={styles.pointName}>
                  <span className={styles.code}>{point.code}</span>
                  <span className={styles.name}>{point.name}</span>
                </div>
                <div className={styles.price}>
                  <span className={styles.priceValue}>
                    {formatCents(point.pricing.pricePerKwhCents)}
                    <span className={styles.unit}> / kWh</span>
                  </span>
                  <span className={styles.priceHint}>
                    {point.pricing.demandFactorApplied
                      ? `Base ${formatCents(point.pricing.baseRateCents ?? point.pricing.utilityRateCents)} × fator`
                      : 'Energia a custo · fator informativo'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}
