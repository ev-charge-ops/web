import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { formatCents } from '@/utils/format-currency'
import { formatDateTime } from '@/utils/format-date'
import { formatMonth } from '@/utils/month'

import { useSessions } from '../api/get-sessions'
import { AnomalyBadge } from './anomaly-badge'
import styles from './recent-anomalies.module.css'

const maxItems = 5

type RecentAnomaliesProps = {
  organizationId: string
  month: string
  sessionsHref: string
}

export function RecentAnomalies({
  organizationId,
  month,
  sessionsHref,
}: RecentAnomaliesProps) {
  const sessions = useSessions(organizationId, { month, pageSize: 100 })
  const flagged = (sessions.data?.items ?? []).filter(
    (session) => session.isAnomaly,
  )

  return (
    <Card flush>
      <div className={styles.head}>
        <h2 className={styles.title}>Anomalias recentes</h2>
        <Link to={sessionsHref} className={styles.link}>
          Ver sessões
        </Link>
      </div>
      {sessions.isPending ? (
        <div className={styles.state}>
          <Spinner label="Carregando anomalias" />
        </div>
      ) : sessions.error ? (
        <div className={styles.state}>
          <Alert>Não foi possível carregar as anomalias.</Alert>
        </div>
      ) : flagged.length === 0 ? (
        <div className={styles.empty}>
          <ShieldCheck size={18} strokeWidth={2} aria-hidden />
          <span>
            Nenhuma sessão atípica em {formatMonth(month)}. O modelo de IA
            avalia cada sessão quando ela é encerrada.
          </span>
        </div>
      ) : (
        <ul className={styles.list} aria-label="Anomalias recentes">
          {flagged.slice(0, maxItems).map((session) => (
            <li className={styles.item} key={session.id}>
              <div className={styles.main}>
                <span className={styles.unit}>{session.unitLabel ?? '—'}</span>
                <span className={styles.meta}>
                  {session.driver.name} · {session.chargePoint.code} ·{' '}
                  {formatDateTime(session.startedAt)}
                </span>
              </div>
              <div className={styles.side}>
                <AnomalyBadge
                  score={session.anomalyScore}
                  isAnomaly={session.isAnomaly}
                />
                <span className={styles.total}>
                  {formatCents(session.totalCents)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
