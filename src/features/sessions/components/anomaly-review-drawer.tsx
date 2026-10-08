import { Drawer } from '@/components/ui/drawer'
import { formatCents } from '@/utils/format-currency'
import { formatDateTime } from '@/utils/format-date'

import { getAnomalyMeta, getAnomalyTitle, type RecentAnomaly } from '../utils/anomaly-summary'
import { AnomalyReviewForm } from './anomaly-review-form'
import styles from './anomaly-review-drawer.module.css'

type AnomalyReviewDrawerProps = {
  organizationId: string
  anomaly: RecentAnomaly | null
  onClose: () => void
}

export function AnomalyReviewDrawer({
  organizationId,
  anomaly,
  onClose,
}: AnomalyReviewDrawerProps) {
  return (
    <Drawer
      isOpen={anomaly !== null}
      onClose={onClose}
      title="Revisar anomalia"
      description={
        anomaly
          ? `${anomaly.driver.name} · ${formatDateTime(anomaly.startedAt)}`
          : undefined
      }
    >
      {anomaly ? (
        <>
          <div className={styles.summary}>
            <span className={styles.title}>{getAnomalyTitle(anomaly)}</span>
            <span className={styles.meta}>{getAnomalyMeta(anomaly)}</span>
            <span className={styles.total}>
              Valor da sessão {formatCents(anomaly.totalCents)}
            </span>
          </div>
          <p className={styles.note}>
            Confirme se a sessão é mesmo atípica ou descarte a sinalização. O
            score vem do modelo de detecção de anomalias; nenhuma cobrança muda
            sem revisão do gestor.
          </p>
          <AnomalyReviewForm
            key={anomaly.sessionId}
            organizationId={organizationId}
            sessionId={anomaly.sessionId}
            defaultNote={anomaly.anomalyReviewNote}
            onReviewed={onClose}
          />
        </>
      ) : null}
    </Drawer>
  )
}
