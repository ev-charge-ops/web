import { useId, type ComponentProps } from 'react'

import { cn } from '@/utils/cn'

import styles from './checkbox-field.module.css'

type CheckboxFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
}

export function CheckboxField({
  label,
  id,
  className,
  ...props
}: CheckboxFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label htmlFor={inputId} className={cn(styles.field, className)}>
      <input id={inputId} type="checkbox" className={styles.control} {...props} />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
