import { CircleCheck, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { cn } from '@/utils/cn'
import { formatMonth } from '@/utils/month'

import {
  getAnomalyMeta,
  getAnomalyTitle,
  type RecentAnomaly,
} from '../utils/anomaly-summary'
import { anomalyReviewLabels } from '../utils/labels'
import { AnomalyReviewDrawer } from './anomaly-review-drawer'
import styles from './recent-anomalies.module.css'

export type { RecentAnomaly }

type RecentAnomaliesProps = {
  organizationId: string
  anomalies: RecentAnomaly[]
  month: string
  sessionsHref: string
}

function AnomalyIcon({ anomaly }: { anomaly: RecentAnomaly }) {
  const status = anomaly.anomalyReviewStatus
  if (status === 'DISMISSED') {
    return (
      <span className={cn(styles.tile, styles.tileDismissed)}>
        <CircleCheck size={20} strokeWidth={2} aria-hidden />
      </span>
    )
  }
  return (
    <span
      className={cn(
        styles.tile,
        status === 'CONFIRMED' ? styles.tileConfirmed : styles.tilePending,
      )}
    >
      <TriangleAlert size={20} strokeWidth={2} aria-hidden />
    </span>
  )
}

export function RecentAnomalies({
  organizationId,
  anomalies,
  month,
  sessionsHref,
}: RecentAnomaliesProps) {
  const [reviewing, setReviewing] = useState<RecentAnomaly | null>(null)

  return (
    <section className={styles.card} aria-labelledby="recent-anomalies-title">
      <div className={styles.head}>
        <h2 id="recent-anomalies-title" className={styles.title}>
          Anomalias detectadas
        </h2>
        <Link to={sessionsHref} className={styles.link}>
          Ver sessões
        </Link>
      </div>
      {anomalies.length === 0 ? (
        <div className={styles.empty}>
          <ShieldCheck size={18} strokeWidth={2} aria-hidden />
          <span>
            Nenhuma sessão atípica em {formatMonth(month)}. O modelo de IA
            avalia cada sessão quando ela é encerrada.
          </span>
        </div>
      ) : (
        <ul className={styles.list} aria-label="Anomalias detectadas">
          {anomalies.map((anomaly) => {
            const status = anomaly.anomalyReviewStatus ?? 'PENDING_REVIEW'
            return (
              <li className={styles.item} key={anomaly.sessionId}>
                <AnomalyIcon anomaly={anomaly} />
                <span className={styles.main}>
                  <span className={styles.label}>{getAnomalyTitle(anomaly)}</span>
                  <span className={styles.meta}>{getAnomalyMeta(anomaly)}</span>
                </span>
                {status === 'PENDING_REVIEW' ? (
                  <button
                    type="button"
                    className={styles.review}
                    aria-label={`Revisar a sessão de ${anomaly.driver.name}`}
                    onClick={() => setReviewing(anomaly)}
                  >
                    Revisar
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.reviewed}
                    aria-label={`${anomalyReviewLabels[status]}: revisar de novo a sessão de ${anomaly.driver.name}`}
                    onClick={() => setReviewing(anomaly)}
                  >
                    {status === 'CONFIRMED' ? 'Confirmada' : 'Descartada'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <p className={styles.note}>
        O score vem do modelo de detecção de anomalias; nenhuma cobrança muda
        sem revisão do gestor.
      </p>
      <AnomalyReviewDrawer
        organizationId={organizationId}
        anomaly={reviewing}
        onClose={() => setReviewing(null)}
      />
    </section>
  )
}
