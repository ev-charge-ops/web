import {
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react'

import { cn } from '@/utils/cn'

import styles from './code-input.module.css'

type CodeInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  length?: number
  error?: string
  disabled?: boolean
  autoFocus?: boolean
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function CodeInput({
  label,
  value,
  onChange,
  onComplete,
  length = 6,
  error,
  disabled,
  autoFocus,
}: CodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const labelId = useId()
  const errorId = useId()

  const focusAt = (index: number) =>
    inputsRef.current[Math.max(0, Math.min(index, length - 1))]?.focus()

  const commit = (next: string) => {
    const code = onlyDigits(next).slice(0, length)
    onChange(code)
    if (code.length === length) onComplete?.(code)
    return code
  }

  const insertAt = (index: number, digits: string) => {
    const start = Math.min(index, value.length)
    const code = commit(
      value.slice(0, start) + digits + value.slice(start + digits.length),
    )
    focusAt(Math.min(start + digits.length, code.length, length - 1))
  }

  const removeAt = (index: number) => {
    commit(value.slice(0, index) + value.slice(index + 1))
  }

  const onInputChange = (index: number, raw: string) => {
    const digits = onlyDigits(raw)
    if (digits) insertAt(index, digits)
    else if (!raw) removeAt(index)
  }

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      event.preventDefault()
      removeAt(index - 1)
      focusAt(index - 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt(Math.min(index + 1, value.length))
    }
  }

  const onPaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const digits = onlyDigits(event.clipboardData.getData('text'))
    event.preventDefault()
    if (!digits) return
    insertAt(digits.length >= length ? 0 : index, digits)
  }

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={error ? errorId : undefined}
      className={styles.field}
    >
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div
        className={styles.boxes}
        style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
      >
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Dígito ${index + 1} de ${length}`}
            aria-invalid={error ? true : undefined}
            autoFocus={autoFocus && index === 0}
            disabled={disabled}
            value={value[index] ?? ''}
            className={cn(styles.box, error && styles.invalid)}
            onFocus={(event) => event.target.select()}
            onChange={(event) => onInputChange(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onPaste={(event) => onPaste(index, event)}
          />
        ))}
      </div>
      {error ? (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </div>
  )
}
