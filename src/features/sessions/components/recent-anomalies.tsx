import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'

import { Card } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'
import type { components } from '@/lib/api-schema'
import { formatCents } from '@/utils/format-currency'
import { formatDateTime } from '@/utils/format-date'
import { formatMonth } from '@/utils/month'

import { formatAnomalySource } from '../utils/labels'
import { AnomalyBadge } from './anomaly-badge'
import styles from './recent-anomalies.module.css'

export type RecentAnomaly = components['schemas']['RecentAnomalyDto']

type RecentAnomaliesProps = {
  anomalies: RecentAnomaly[]
  anomaliesCount: number
  month: string
  sessionsHref: string
}

export function RecentAnomalies({
  anomalies,
  anomaliesCount,
  month,
  sessionsHref,
}: RecentAnomaliesProps) {
  return (
    <Card flush>
      <div className={styles.head}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Anomalias recentes</h2>
          <StatusPill tone={anomaliesCount > 0 ? 'fault' : 'charging'}>
            {anomaliesCount} no mês
          </StatusPill>
        </div>
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
        <ul className={styles.list} aria-label="Anomalias recentes">
          {anomalies.map((anomaly) => (
            <li className={styles.item} key={anomaly.sessionId}>
              <div className={styles.main}>
                <span className={styles.label}>
                  <span className={styles.unit}>{anomaly.unitLabel ?? '—'}</span>
                  <span className={styles.source}>
                    {formatAnomalySource(anomaly.anomalyModelVersion)}
                  </span>
                </span>
                <span className={styles.meta}>
                  {anomaly.driver.name} · {anomaly.chargePoint.code} ·{' '}
                  {formatDateTime(anomaly.startedAt)}
                </span>
              </div>
              <div className={styles.side}>
                <AnomalyBadge score={anomaly.anomalyScore} isAnomaly />
                <span className={styles.total}>
                  {formatCents(anomaly.totalCents)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
