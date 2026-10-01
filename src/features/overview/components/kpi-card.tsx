import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import styles from './kpi-card.module.css'

export type KpiTone = 'default' | 'positive' | 'critical'

type KpiCardProps = {
  label: string
  value: ReactNode
  prefix?: string
  unit?: string
  hint?: ReactNode
  hintTone?: KpiTone
  delta?: string
  deltaTone?: KpiTone
}

export function KpiCard({
  label,
  value,
  prefix,
  unit,
  hint,
  hintTone = 'default',
  delta,
  deltaTone = 'default',
}: KpiCardProps) {
  return (
    <section className={styles.card} aria-label={label}>
      <span className={styles.label}>{label}</span>
      <span className={styles.pair}>
        {prefix ? <span className={styles.unit}>{prefix}</span> : null}
        <span className={styles.value}>{value}</span>
        {unit ? <span className={styles.unit}>{unit}</span> : null}
      </span>
      {hint || delta ? (
        <span className={styles.notes}>
          {hint ? (
            <span className={cn(styles.note, styles[hintTone])}>{hint}</span>
          ) : null}
          {delta ? (
            <span className={cn(styles.note, styles[deltaTone])}>{delta}</span>
          ) : null}
        </span>
      ) : null}
    </section>
  )
}
