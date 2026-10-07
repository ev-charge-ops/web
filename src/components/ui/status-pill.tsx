import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import styles from './status-pill.module.css'

export type StatusTone = 'charging' | 'idle' | 'fault' | 'info' | 'offline'

type StatusPillProps = {
  tone?: StatusTone
  withDot?: boolean
  className?: string
  children: ReactNode
}

export function StatusPill({
  tone = 'info',
  withDot = false,
  className,
  children,
}: StatusPillProps) {
  return (
    <span className={cn(styles.pill, styles[tone], className)} data-tone={tone}>
      {withDot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
