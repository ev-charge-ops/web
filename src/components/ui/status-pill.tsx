import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import styles from './status-pill.module.css'

export type StatusTone = 'charging' | 'idle' | 'fault' | 'info' | 'offline'

type StatusPillProps = {
  tone?: StatusTone
  isLive?: boolean
  className?: string
  children: ReactNode
}

export function StatusPill({
  tone = 'info',
  isLive = false,
  className,
  children,
}: StatusPillProps) {
  return (
    <span
      className={cn(styles.pill, styles[tone], isLive && styles.live, className)}
      data-tone={tone}
      data-live={isLive || undefined}
    >
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  )
}
