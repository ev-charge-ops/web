import { AnimatedNumber } from '@/components/ui/animated-number'
import { cn } from '@/utils/cn'
import { formatTime } from '@/utils/format-date'
import { formatClockDuration } from '@/utils/format-duration'
import { formatEnergy } from '@/utils/format-energy'
import { formatPower } from '@/utils/format-power'

import type { OrganizationSessionDetail } from '../api/get-organization-session'
import { formatAnomalyScore, formatAnomalySource } from '../utils/labels'
import { getAveragePowerKw, getChargingMinutes } from '../utils/session-metrics'
import styles from './anomaly-score-card.module.css'

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  timeZone: 'America/Sao_Paulo',
})

type AnomalyScoreCardProps = {
  session: OrganizationSessionDetail
}

export function AnomalyScoreCard({ session }: AnomalyScoreCardProps) {
  if (session.anomalyScore === null) {
    return (
      <div className={styles.card}>
        <span className={styles.title}>Score de anomalia</span>
        <p className={styles.note}>
          O modelo de anomalias avalia a sessão quando ela é encerrada. O score
          aparece aqui depois do fechamento.
        </p>
      </div>
    )
  }

  const isFlagged =
    Boolean(session.isAnomaly) && session.anomalyReviewStatus !== 'DISMISSED'
  const signals = [
    {
      label: 'Início',
      value: `${weekdayFormatter.format(new Date(session.startedAt))}, ${formatTime(session.startedAt)}`,
    },
    {
      label: 'Tempo carregando',
      value: formatClockDuration(getChargingMinutes(session)),
    },
    {
      label: 'Energia',
      value: formatEnergy(session.energyKwh, { maximumFractionDigits: 2 }),
    },
    {
      label: 'Potência média',
      value: `${formatPower(getAveragePowerKw(session))} de ${formatPower(session.allocatedPowerKw)}`,
    },
  ]

  return (
    <div className={cn(styles.card, isFlagged && styles.flagged)}>
      <div className={styles.head}>
        <div className={styles.heading}>
          <span className={styles.title}>Score de anomalia</span>
          <span className={styles.reason}>
            {session.isAnomaly
              ? 'Sessão atípica para o histórico do condomínio'
              : 'Dentro do padrão do condomínio'}
          </span>
        </div>
        <AnimatedNumber
          className={styles.score}
          value={session.anomalyScore}
          format={formatAnomalyScore}
          durationMs={1600}
          delayMs={600}
        />
      </div>
      <div className={styles.meter} aria-hidden="true">
        <span
          className={styles.fill}
          style={{ width: `${Math.min(100, session.anomalyScore * 100)}%` }}
        />
      </div>
      {session.isAnomaly ? (
        <dl className={styles.signals}>
          {signals.map(({ label, value }) => (
            <div className={styles.signal} key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <span className={styles.note}>
        {formatAnomalySource(session.anomalyModelVersion)} · de 0 (comum) a 1
        (muito incomum). Nenhuma cobrança muda sem revisão do gestor.
      </span>
    </div>
  )
}
