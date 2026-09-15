import { cn } from '@/utils/cn'

import styles from './spinner.module.css'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export function Spinner({
  size = 'md',
  label = 'Carregando',
  className,
}: SpinnerProps) {
  return (
    <span role="status" className={cn(styles.spinner, styles[size], className)}>
      <span className="sr-only">{label}</span>
    </span>
  )
}
