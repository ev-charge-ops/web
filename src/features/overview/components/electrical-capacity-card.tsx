import type { ReactNode } from 'react'

import { StatusPill, type StatusTone } from '@/components/ui/status-pill'
import { cn } from '@/utils/cn'
import { formatDayMonth, formatTime } from '@/utils/format-date'
import { formatPercent } from '@/utils/format-percent'
import { formatPower } from '@/utils/format-power'

import type {
  MonthPeak,
  OverviewChargePoint,
  SiteCapacity,
} from '../api/get-overview'
import styles from './electrical-capacity-card.module.css'

const warningPercent = 80

const powerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

type ElectricalCapacityCardProps = {
  capacity: SiteCapacity
  chargePoints: Pick<OverviewChargePoint, 'id' | 'code' | 'currentPowerKw'>[]
  monthPeak?: MonthPeak
  subtitle?: ReactNode
  hasAvailableLegend?: boolean
  children?: ReactNode
}

function getHeadroom(capacity: SiteCapacity): {
  tone: StatusTone
  label: string
} {
  if (capacity.utilizationPercent >= 100) {
    return { tone: 'fault', label: 'Acima do limite' }
  }
  if (capacity.utilizationPercent >= warningPercent) {
    return { tone: 'idle', label: 'Perto do limite' }
  }
  return { tone: 'charging', label: 'Folga' }
}

function share(powerKw: number, totalKw: number) {
  return `${totalKw > 0 ? Math.min(100, (powerKw / totalKw) * 100) : 0}%`
}

function describePeak(monthPeak: MonthPeak) {
  if (!monthPeak.at) return 'Pico do mês: sem recargas até agora.'
  return `Pico do mês: ${formatPower(monthPeak.demandKw)} em ${formatDayMonth(monthPeak.at)} às ${formatTime(monthPeak.at)}.`
}

export function ElectricalCapacityCard({
  capacity,
  chargePoints,
  monthPeak,
  subtitle,
  hasAvailableLegend = false,
  children,
}: ElectricalCapacityCardProps) {
  const pointLoads = chargePoints.filter((point) => point.currentPowerKw > 0)
  const chargingNowKw = pointLoads.length
    ? pointLoads.reduce((total, point) => total + point.currentPowerKw, 0)
    : capacity.chargingDemandKw
  const headroom = getHeadroom(capacity)
  const chargingCapacityKw = Math.max(
    0,
    capacity.contractedDemandKw - capacity.commonAreaReserveKw,
  )
  const segments =
    pointLoads.length > 0
      ? pointLoads.map((point) => ({
          key: point.id,
          label: `${point.code} · ${formatPower(point.currentPowerKw)}`,
          powerKw: point.currentPowerKw,
        }))
      : capacity.chargingDemandKw > 0
        ? [
            {
              key: 'charging',
              label: `Recargas agora · ${formatPower(capacity.chargingDemandKw)}`,
              powerKw: capacity.chargingDemandKw,
            },
          ]
        : []

  return (
    <section
      className={styles.card}
      aria-labelledby="electrical-capacity-title"
    >
      <div className={styles.head}>
        <div className={styles.heading}>
          <h2 id="electrical-capacity-title" className={styles.title}>
            Capacidade elétrica
          </h2>
          <span className={styles.subtitle}>
            {subtitle ?? (
              <>
                Demanda contratada {formatPower(capacity.contractedDemandKw)} ·
                reserva de área comum{' '}
                {formatPower(capacity.commonAreaReserveKw)}
              </>
            )}
          </span>
        </div>
        <StatusPill tone={headroom.tone} isLive={segments.length > 0}>
          {headroom.label}
        </StatusPill>
      </div>

      <div className={styles.figure}>
        <span className={styles.value}>
          {powerFormatter.format(chargingNowKw)}
        </span>
        <span className={styles.unit}>
          de {formatPower(chargingCapacityKw)} para recarga
        </span>
      </div>

      <div className={styles.meter}>
        <div
          className={styles.bar}
          role="meter"
          aria-label="Demanda atual sobre o limite contratado"
          aria-valuemin={0}
          aria-valuemax={capacity.contractedDemandKw}
          aria-valuenow={capacity.currentDemandKw}
          aria-valuetext={`${formatPower(capacity.currentDemandKw)} de ${formatPower(capacity.contractedDemandKw)} (${formatPercent(capacity.utilizationPercent)})`}
        >
          {segments.map((segment, index) => (
            <span
              key={segment.key}
              className={cn(
                styles.segment,
                index % 2 === 1 && styles.segmentAlt,
              )}
              style={{
                width: share(segment.powerKw, capacity.contractedDemandKw),
              }}
            />
          ))}
          <span className={styles.spacer} />
          <span
            className={styles.reserve}
            style={{
              width: share(
                capacity.commonAreaReserveKw,
                capacity.contractedDemandKw,
              ),
            }}
          />
        </div>
        <ul className={styles.legend}>
          {segments.map((segment, index) => (
            <li key={segment.key}>
              <span
                className={cn(
                  styles.swatch,
                  index % 2 === 1 && styles.segmentAlt,
                )}
                aria-hidden="true"
              />
              {segment.label}
            </li>
          ))}
          {hasAvailableLegend ? (
            <li>
              <span
                className={cn(styles.swatch, styles.available)}
                aria-hidden="true"
              />
              Disponível para recarga
            </li>
          ) : null}
          <li>
            <span
              className={cn(styles.swatch, styles.reserve)}
              aria-hidden="true"
            />
            Reserva comum
            {hasAvailableLegend
              ? ` · ${formatPower(capacity.commonAreaReserveKw)}`
              : ''}
          </li>
        </ul>
      </div>

      {children}

      {monthPeak ? (
        <p className={styles.note}>
          {describePeak(monthPeak)}{' '}
          {capacity.upgradeRecommended
            ? `O pico médio diário passa de ${warningPercent}% do contratado (${formatPercent(capacity.averagePeakUtilizationPercent)}). Avalie aumentar a demanda contratada.`
            : 'Sem necessidade de aumento de demanda.'}
        </p>
      ) : null}
    </section>
  )
}
