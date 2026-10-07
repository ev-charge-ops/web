import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import { Card } from './card'
import styles from './metric-tile.module.css'

export type MetricTone = 'default' | 'demand' | 'fault' | 'charging'

type MetricTileProps = {
  eyebrow?: string
  value: ReactNode
  unit?: string
  hint?: ReactNode
  tone?: MetricTone
  className?: string
}

export function MetricTile({
  eyebrow,
  value,
  unit,
  hint,
  tone = 'default',
  className,
}: MetricTileProps) {
  return (
    <Card className={cn(styles.tile, className)}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <div className={styles.pair}>
        <span className={cn(styles.value, tone !== 'default' && styles[tone])}>
          {value}
        </span>
        {unit ? <span className={styles.unit}>{unit}</span> : null}
      </div>
      {hint ? <div className={styles.hint}>{hint}</div> : null}
    </Card>
  )
}
