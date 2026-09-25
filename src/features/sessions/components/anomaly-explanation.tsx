import { ShieldCheck, Sparkles } from 'lucide-react'

import { cn } from '@/utils/cn'
import { formatCents } from '@/utils/format-currency'
import { formatTime } from '@/utils/format-date'
import { formatDuration } from '@/utils/format-duration'
import { formatEnergy } from '@/utils/format-energy'
import { formatPower } from '@/utils/format-power'

import type { OrganizationSessionDetail } from '../api/get-organization-session'
import { formatAnomalyScore } from '../utils/labels'
import { getAveragePowerKw, getChargingMinutes } from '../utils/session-metrics'
import styles from './anomaly-explanation.module.css'

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  timeZone: 'America/Sao_Paulo',
})

type AnomalyExplanationProps = {
  session: OrganizationSessionDetail
}

export function AnomalyExplanation({ session }: AnomalyExplanationProps) {
  if (session.anomalyScore === null) {
    return (
      <div className={styles.box}>
        <p className={styles.body}>
          O modelo de anomalias avalia a sessão quando ela é encerrada. O score
          aparece aqui depois do fechamento.
        </p>
      </div>
    )
  }

  const score = formatAnomalyScore(session.anomalyScore)

  if (!session.isAnomaly) {
    return (
      <div className={cn(styles.box, styles.ok)}>
        <div className={styles.head}>
          <ShieldCheck size={18} strokeWidth={2} aria-hidden className={styles.icon} />
          <div>
            <div className={styles.title}>Dentro do padrão · score {score}</div>
            <p className={styles.body}>
              O modelo de IA comparou esta sessão com o histórico do condomínio e
              não encontrou desvios relevantes.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const chargingMinutes = getChargingMinutes(session)
  const averagePowerKw = getAveragePowerKw(session)
  const signals = [
    {
      label: 'Início',
      value: `${weekdayFormatter.format(new Date(session.startedAt))}, ${formatTime(session.startedAt)}`,
    },
    { label: 'Tempo carregando', value: formatDuration(chargingMinutes) },
    {
      label: 'Energia entregue',
      value: formatEnergy(session.energyKwh, { maximumFractionDigits: 2 }),
    },
    {
      label: 'Potência média',
      value: `${formatPower(averagePowerKw)} de ${formatPower(session.allocatedPowerKw)} alocados`,
    },
    { label: 'Ocupação após a recarga', value: formatDuration(session.idleMinutes) },
    { label: 'Valor da sessão', value: formatCents(session.totalCents) },
  ]

  return (
    <div className={cn(styles.box, styles.flagged)}>
      <div className={styles.head}>
        <Sparkles size={18} strokeWidth={2} aria-hidden className={styles.icon} />
        <div>
          <div className={styles.title}>Sessão sinalizada · score {score}</div>
          <p className={styles.body}>
            O modelo de IA de detecção de anomalias comparou esta sessão com o
            histórico do condomínio e a considerou atípica. O score vai de 0
            (comum) a 1 (muito incomum). Confira os sinais que o modelo avalia
            antes de levar o valor ao rateio.
          </p>
        </div>
      </div>
      <dl className={styles.signals}>
        {signals.map(({ label, value }) => (
          <div className={styles.signal} key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
