import type { components } from '@/lib/api-schema'
import { cn } from '@/utils/cn'
import { formatPower } from '@/utils/format-power'

import styles from './full-load-card.module.css'

type FullLoadPoint = Pick<
  components['schemas']['OverviewChargePointDto'],
  'id' | 'code' | 'maxPowerKw' | 'type'
>

type FullLoadCardProps = {
  capacity: components['schemas']['SiteCapacityDto']
  chargePoints: FullLoadPoint[]
}

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

function share(powerKw: number, totalKw: number) {
  return `${totalKw > 0 ? Math.min(100, (powerKw / totalKw) * 100) : 0}%`
}

export function FullLoadCard({ capacity, chargePoints }: FullLoadCardProps) {
  const chargingCapacityKw = Math.max(
    0,
    capacity.contractedDemandKw - capacity.commonAreaReserveKw,
  )
  const points = [...chargePoints].sort((a, b) => b.maxPowerKw - a.maxPowerKw)
  const totalKw = points.reduce((total, point) => total + point.maxPowerKw, 0)
  const fits = totalKw <= chargingCapacityKw
  const count = points.length
  const capacityLabel = formatPower(chargingCapacityKw)

  return (
    <section className={styles.card} aria-labelledby="full-load-title">
      <div className={styles.heading}>
        <h2 id="full-load-title" className={styles.title}>
          Com {count === 1 ? 'o ponto' : `os ${count} pontos`} em uso
        </h2>
        <p className={styles.subtitle}>
          Os {capacityLabel} para recarga são divididos entre as sessões ativas.
          Cada sessão recebe até a potência máxima do ponto.
        </p>
      </div>

      <ul className={styles.bars} aria-label="Potência máxima por ponto">
        {points.map((point, index) => (
          <li className={styles.row} key={point.id}>
            <span className={styles.code}>{point.code}</span>
            <span className={styles.track} aria-hidden="true">
              <span
                className={cn(
                  styles.fill,
                  point.type === 'COMMERCIAL' && styles.commercial,
                )}
                style={{
                  width: share(point.maxPowerKw, chargingCapacityKw),
                  animationDelay: `${0.2 + index * 0.1}s`,
                }}
              />
            </span>
            <span className={styles.value}>
              {numberFormatter.format(point.maxPowerKw)}{' '}
              <span className={styles.unit}>kW</span>
            </span>
          </li>
        ))}
        <li className={cn(styles.row, styles.sum)}>
          <span className={styles.code}>Soma</span>
          <span className={styles.caption}>
            Barras em relação a {capacityLabel}
          </span>
          <span className={styles.value}>
            {numberFormatter.format(totalKw)}{' '}
            <span className={styles.unit}>kW</span>
          </span>
        </li>
      </ul>

      <p className={cn(styles.verdict, !fits && styles.over)}>
        {fits
          ? `Hoje ${count === 1 ? 'cabe a sessão' : `cabem as ${count} sessões`} na potência máxima (${formatPower(totalKw)} de ${capacityLabel}).`
          : `Com todos os pontos ao mesmo tempo, a soma (${formatPower(totalKw)}) passa dos ${capacityLabel} para recarga.`}
      </p>
      <p className={styles.note}>
        Uma nova sessão recebe a potência máxima do ponto ou o que sobrar dos{' '}
        {capacityLabel}, o que for menor. A reserva de{' '}
        {formatPower(capacity.commonAreaReserveKw)} fica para as áreas comuns.
      </p>
    </section>
  )
}
