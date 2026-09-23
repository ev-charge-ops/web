import { cn } from '@/utils/cn'

import styles from './meter.module.css'

export type MeterTone = 'energy' | 'demand' | 'over'

type MeterProps = {
  label: string
  value: number
  max: number
  tone?: MeterTone
  className?: string
}

export function Meter({
  label,
  value,
  max,
  tone = 'demand',
  className,
}: MeterProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(styles.track, className)}
    >
      <div
        className={cn(styles.fill, styles[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
