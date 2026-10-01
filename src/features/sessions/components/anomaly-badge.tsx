import { Sparkles } from 'lucide-react'

import { StatusPill } from '@/components/ui/status-pill'

import type { AnomalyReviewStatus } from '../api/review-session-anomaly'
import { formatAnomalyScore } from '../utils/labels'
import styles from './anomaly-badge.module.css'

type AnomalyBadgeProps = {
  score: number | null
  isAnomaly: boolean | null
  reviewStatus?: AnomalyReviewStatus | null
}

export function AnomalyBadge({ score, isAnomaly, reviewStatus }: AnomalyBadgeProps) {
  if (score === null) {
    return <span className={styles.none}>—</span>
  }

  if (!isAnomaly) {
    return (
      <span className={styles.score} title="Score de anomalia">
        {formatAnomalyScore(score)}
      </span>
    )
  }

  if (reviewStatus === 'DISMISSED') {
    return (
      <StatusPill tone="offline" className={styles.badge}>
        Descartada · {formatAnomalyScore(score)}
      </StatusPill>
    )
  }

  return (
    <StatusPill
      tone={reviewStatus === 'CONFIRMED' ? 'idle' : 'fault'}
      className={styles.badge}
    >
      <Sparkles size={12} strokeWidth={2.2} aria-hidden />
      {reviewStatus === 'CONFIRMED' ? 'Confirmada' : 'Anomalia'} ·{' '}
      {formatAnomalyScore(score)}
    </StatusPill>
  )
}
