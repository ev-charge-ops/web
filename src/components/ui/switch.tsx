import { useId } from 'react'

import { cn } from '@/utils/cn'

import styles from './switch.module.css'

type SwitchProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function Switch({ label, checked, onChange, className }: SwitchProps) {
  const id = useId()

  return (
    <div className={cn(styles.field, className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={styles.track}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} aria-hidden="true" />
      </button>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
    </div>
  )
}
