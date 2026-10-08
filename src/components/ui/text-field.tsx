import { useId, type ComponentProps, type ReactNode } from 'react'

import { cn } from '@/utils/cn'

import styles from './text-field.module.css'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  labelAction?: ReactNode
  hint?: ReactNode
  error?: string
  trailing?: ReactNode
  footer?: ReactNode
}

export function TextField({
  label,
  labelAction,
  hint,
  error,
  trailing,
  footer,
  id,
  className,
  'aria-describedby': ariaDescribedBy,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const describedBy = [error && errorId, hint && hintId, ariaDescribedBy]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cn(styles.field, className)}>
      {labelAction ? (
        <div className={styles.labelRow}>
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
          {labelAction}
        </div>
      ) : (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      {trailing !== undefined ? (
        <div className={styles.controlWrap}>
          <input
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            className={cn(
              styles.control,
              styles.withTrailing,
              error && styles.invalid,
            )}
            {...props}
          />
          <div className={styles.trailing}>{trailing}</div>
        </div>
      ) : (
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(styles.control, error && styles.invalid)}
          {...props}
        />
      )}
      {footer}
      {hint ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </div>
  )
}
