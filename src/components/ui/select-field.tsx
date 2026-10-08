import { ChevronDown } from 'lucide-react'
import { useId, type ComponentProps } from 'react'

import { cn } from '@/utils/cn'

import styles from './select-field.module.css'

export type SelectOption = {
  value: string
  label: string
}

type SelectFieldProps = Omit<ComponentProps<'select'>, 'children'> & {
  label: string
  options: SelectOption[]
  isDense?: boolean
}

export function SelectField({
  label,
  options,
  isDense = false,
  id,
  className,
  ...props
}: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className={cn(styles.field, isDense && styles.dense, className)}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <div className={styles.wrap}>
        <select id={selectId} className={styles.control} {...props}>
          {options.map(({ value, label: optionLabel }) => (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden
          className={styles.icon}
        />
      </div>
    </div>
  )
}
