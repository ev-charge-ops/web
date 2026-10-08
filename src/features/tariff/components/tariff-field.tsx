import { Minus, Plus } from 'lucide-react'
import { useId, type ComponentProps } from 'react'

import { cn } from '@/utils/cn'

import styles from './tariff-field.module.css'

type TariffFieldProps = Omit<ComponentProps<'input'>, 'prefix' | 'step'> & {
  label: string
  prefix?: string
  suffix?: string
  error?: string
  stepper?: {
    label: string
    onDecrease: () => void
    onIncrease: () => void
  }
}

export function TariffField({
  label,
  prefix,
  suffix,
  error,
  stepper,
  id,
  className,
  ...props
}: TariffFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={cn(styles.box, error && styles.invalid)}>
        {prefix ? <span className={styles.prefix}>{prefix}</span> : null}
        <input
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
        {stepper ? (
          <>
            <button
              type="button"
              className={styles.step}
              aria-label={`Diminuir ${stepper.label}`}
              onClick={stepper.onDecrease}
            >
              <Minus size={18} strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              className={styles.step}
              aria-label={`Aumentar ${stepper.label}`}
              onClick={stepper.onIncrease}
            >
              <Plus size={18} strokeWidth={2} aria-hidden />
            </button>
          </>
        ) : null}
      </div>
      {error ? (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </div>
  )
}
