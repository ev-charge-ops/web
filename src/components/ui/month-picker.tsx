import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useId } from 'react'

import { cn } from '@/utils/cn'
import { formatMonth, formatShortMonth, shiftMonth } from '@/utils/month'

import styles from './month-picker.module.css'

type MonthPickerProps = {
  label?: string
  value: string
  max?: string
  isLabelHidden?: boolean
  isCompact?: boolean
  onChange: (month: string) => void
}

export function MonthPicker({
  label = 'Mês',
  value,
  max,
  isLabelHidden = false,
  isCompact = false,
  onChange,
}: MonthPickerProps) {
  const labelId = useId()
  const isAtMax = Boolean(max && value >= max)

  return (
    <div role="group" aria-labelledby={labelId} className={styles.field}>
      <span
        id={labelId}
        className={isLabelHidden ? 'sr-only' : styles.label}
      >
        {label}
      </span>
      <div className={cn(styles.control, isCompact && styles.compact)}>
        <button
          type="button"
          className={styles.step}
          aria-label="Mês anterior"
          onClick={() => onChange(shiftMonth(value, -1))}
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden />
        </button>
        <span className={styles.value} aria-live="polite">
          {isCompact ? (
            <>
              <span aria-hidden="true">{formatShortMonth(value)}</span>
              <span className="sr-only">{formatMonth(value)}</span>
            </>
          ) : (
            formatMonth(value)
          )}
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
