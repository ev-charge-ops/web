import { Sparkles } from 'lucide-react'

import { StatusPill } from '@/components/ui/status-pill'

import { formatAnomalyScore } from '../utils/labels'
import styles from './anomaly-badge.module.css'

type AnomalyBadgeProps = {
  score: number | null
  isAnomaly: boolean | null
}

export function AnomalyBadge({ score, isAnomaly }: AnomalyBadgeProps) {
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

  return (
    <StatusPill tone="fault" className={styles.badge}>
      <Sparkles size={12} strokeWidth={2.2} aria-hidden />
      Anomalia · {formatAnomalyScore(score)}
    </StatusPill>
  )
}
