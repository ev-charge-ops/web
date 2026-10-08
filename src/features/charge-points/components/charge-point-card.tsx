import { Link } from 'react-router'

import { StatusPill, type StatusTone } from '@/components/ui/status-pill'
import { paths } from '@/config/paths'
import { useNow } from '@/hooks/use-now'
import type { components } from '@/lib/api-schema'
import { cn } from '@/utils/cn'
import { formatCents } from '@/utils/format-currency'
import { formatCountdown } from '@/utils/format-duration'
import { formatPower } from '@/utils/format-power'

import type { ChargePoint } from '../api/get-charge-points'
import {
  chargePointStatusLabels,
  chargePointStatusTones,
  chargePointTypeLabels,
  chargePointTypeTones,
  connectorLabels,
} from '../utils/labels'
import styles from './charge-point-card.module.css'

const fallbackPointPhoto = '/media/points/charger-wall.webp'

export type PointLive = {
  currentPowerKw: number
  activeSession: components['schemas']['OverviewActiveSessionDto'] | null
}

type ChargePointCardProps = {
  chargePoint: ChargePoint
  live?: PointLive
}

const powerFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function getLiveStatus(
  chargePoint: ChargePoint,
  live: PointLive | undefined,
  now: number,
): { label: string; tone: StatusTone; isLive?: boolean } {
  const session = live?.activeSession
  if (session?.status === 'GRACE' && session.graceEndsAt) {
    return {
      label: `Tolerância ${formatCountdown(new Date(session.graceEndsAt).getTime() - now)}`,
      tone: 'idle',
    }
  }
  if (session?.status === 'IDLE') {
    return { label: 'Ocupando a vaga', tone: 'fault' }
  }
  if (session?.status === 'PENDING' || session?.status === 'AWAITING_PAYMENT') {
    return { label: 'Iniciando', tone: 'info' }
  }
  if (session?.status === 'ACTIVE' || chargePoint.status === 'CHARGING') {
    return { label: 'Carregando', tone: 'charging', isLive: true }
  }
  return {
    label: chargePointStatusLabels[chargePoint.status],
    tone: chargePointStatusTones[chargePoint.status],
  }
}

export function ChargePointCard({ chargePoint, live }: ChargePointCardProps) {
  const { charger, pricing } = chargePoint
  const isInGrace = live?.activeSession?.status === 'GRACE'
  const now = useNow(1000, isInGrace)
  const status = getLiveStatus(chargePoint, live, now)
  const powerKw = live?.currentPowerKw ?? 0
  const titleId = `point-${chargePoint.id}`

  const lines = [
    {
      label: 'Serial',
      value: charger?.serialNumber ?? 'Não vinculado',
      isMono: Boolean(charger),
    },
    { label: 'Potência máxima', value: formatPower(chargePoint.maxPowerKw) },
    ...(charger
      ? [
          {
            label: 'Carregador',
            value: `${charger.vendor} · ${connectorLabels[charger.connector]}`,
          },
        ]
      : []),
    {
      label: 'Preço agora',
      value: pricing
        ? `${formatCents(pricing.pricePerKwhCents)}/kWh`
        : 'Sem tarifa',
    },
  ]

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <img
        src={chargePoint.photoUrl ?? fallbackPointPhoto}
        alt=""
        className={styles.photo}
        loading="lazy"
      />
      <div className={styles.body}>
        <div className={styles.head}>
          <div className={styles.identity}>
            <h3 id={titleId} className={styles.code}>
              {chargePoint.code}
            </h3>
            <span className={styles.name}>{chargePoint.name}</span>
          </div>
          <StatusPill tone={chargePointTypeTones[chargePoint.type]}>
            {chargePointTypeLabels[chargePoint.type]}
          </StatusPill>
        </div>

        <div className={styles.live}>
          <StatusPill tone={status.tone} isLive={status.isLive}>
            {status.label}
          </StatusPill>
          <span className={cn(styles.power, powerKw === 0 && styles.idle)}>
            <span className={styles.powerValue}>
              {powerFormatter.format(powerKw)}
            </span>
            <span className={styles.powerUnit}>kW</span>
          </span>
        </div>

        <dl className={styles.lines}>
          {lines.map(({ label, value, isMono }) => (
            <div className={styles.line} key={label}>
              <dt>{label}</dt>
              <dd className={isMono ? styles.mono : undefined}>{value}</dd>
            </div>
          ))}
        </dl>

        <Link
          to={`${paths.sessions.getHref()}?point=${encodeURIComponent(chargePoint.id)}`}
          className={styles.action}
        >
          Ver sessões
        </Link>
      </div>
    </article>
  )
}
