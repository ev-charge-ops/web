import type { HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

import styles from './card.module.css'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  flush?: boolean
}

export function Card({ flush = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(styles.card, flush && styles.flush, className)}
      {...props}
    />
  )
}
