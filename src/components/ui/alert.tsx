import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import styles from './alert.module.css'

export type AlertTone = 'error' | 'success' | 'info'

const toneIcons = {
  error: CircleAlert,
  success: CircleCheck,
  info: Info,
} satisfies Record<AlertTone, unknown>

type AlertProps = {
  tone?: AlertTone
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function Alert({ tone = 'error', action, className, children }: AlertProps) {
  const Icon = toneIcons[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(styles.alert, styles[tone], className)}
    >
      <Icon size={16} strokeWidth={2} className={styles.icon} aria-hidden />
      <div className={styles.body}>
        <span>{children}</span>
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
    </div>
  )
}
