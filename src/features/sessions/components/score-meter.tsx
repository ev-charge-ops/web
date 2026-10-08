import { cn } from '@/utils/cn'

import { formatAnomalyScore } from '../utils/labels'
import styles from './score-meter.module.css'

type ScoreMeterProps = {
  score: number | null
  isFlagged: boolean
}

function getTone(score: number, isFlagged: boolean) {
  if (isFlagged) return styles.critical
  if (score >= 0.5) return styles.warning
  return styles.neutral
}

export function ScoreMeter({ score, isFlagged }: ScoreMeterProps) {
  if (score === null) {
    return <span className={styles.none}>—</span>
  }

  return (
    <span className={cn(styles.meter, getTone(score, isFlagged))}>
      <span className={styles.track} aria-hidden="true">
        <span
          className={styles.fill}
          style={{ width: `${Math.min(100, Math.max(0, score * 100))}%` }}
        />
      </span>
      <span className={styles.value}>{formatAnomalyScore(score)}</span>
    </span>
  )
}
