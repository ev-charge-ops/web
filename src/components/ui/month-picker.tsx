import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useId } from 'react'

import { formatMonth, shiftMonth } from '@/utils/month'

import styles from './month-picker.module.css'

type MonthPickerProps = {
  label?: string
  value: string
  max?: string
  onChange: (month: string) => void
}

export function MonthPicker({
  label = 'Mês',
  value,
  max,
  onChange,
}: MonthPickerProps) {
  const labelId = useId()
  const isAtMax = Boolean(max && value >= max)

  return (
    <div role="group" aria-labelledby={labelId} className={styles.field}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.control}>
        <button
          type="button"
          className={styles.step}
          aria-label="Mês anterior"
          onClick={() => onChange(shiftMonth(value, -1))}
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden />
        </button>
        <span className={styles.value} aria-live="polite">
          {formatMonth(value)}
        </span>
        <button
          type="button"
          className={styles.step}
          aria-label="Próximo mês"
          disabled={isAtMax}
          onClick={() => onChange(shiftMonth(value, 1))}
        >
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  )
}
