import { BackgroundVideo } from '@/components/ui/background-video'
import { useNow } from '@/hooks/use-now'
import { formatDuration } from '@/utils/format-duration'
import { formatPower } from '@/utils/format-power'

import type { OverviewChargePoint } from '../api/get-overview'
import styles from './live-now-card.module.css'

type LiveNowCardProps = {
  chargePoints: OverviewChargePoint[]
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function describePoint(point: OverviewChargePoint, now: number) {
  const session = point.activeSession
  const graceEndsAt = session?.graceEndsAt
    ? new Date(session.graceEndsAt).getTime()
    : null

  if (session?.status === 'GRACE' && graceEndsAt !== null) {
    return `${point.code} em tolerância · ${formatCountdown(graceEndsAt - now)}`
  }
  if (session?.status === 'IDLE' && graceEndsAt !== null) {
    return `${point.code} ocupando a vaga · ${formatDuration((now - graceEndsAt) / 60_000)}`
  }
  if (session?.status === 'ACTIVE' || point.status === 'CHARGING') {
    return point.currentPowerKw > 0
      ? `${point.code} carregando · ${formatPower(point.currentPowerKw)}`
      : `${point.code} carregando`
  }
  if (session?.status === 'PENDING' || session?.status === 'AWAITING_PAYMENT') {
    return `${point.code} iniciando`
  }
  return `${point.code} ocupado`
}

function isInUse(point: OverviewChargePoint) {
  return (
    point.activeSession !== null ||
    point.status === 'CHARGING' ||
    point.status === 'IDLE'
  )
}

export function LiveNowCard({ chargePoints }: LiveNowCardProps) {
  const inUse = chargePoints.filter(isInUse)
  const hasTimer = inUse.some(
    (point) =>
      point.activeSession?.status === 'GRACE' ||
      point.activeSession?.status === 'IDLE',
  )
  const now = useNow(1000, hasTimer)

  return (
    <section className={styles.card} aria-labelledby="live-now-title">
      <BackgroundVideo src="/media/garage-loop" className={styles.video} />
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.content}>
        <span className={styles.badge}>
          <span className={styles.dot} aria-hidden="true" />
          Agora
        </span>
        <h2 id="live-now-title" className={styles.title}>
          {inUse.length} de {chargePoints.length}{' '}
          {chargePoints.length === 1 ? 'ponto em uso' : 'pontos em uso'}
        </h2>
        <ul className={styles.chips} aria-label="Pontos em uso agora">
          {inUse.length === 0 ? (
            <li className={styles.chip}>Todos os pontos livres</li>
          ) : (
            inUse.map((point) => (
              <li className={styles.chip} key={point.id}>
                {describePoint(point, now)}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  )
}
