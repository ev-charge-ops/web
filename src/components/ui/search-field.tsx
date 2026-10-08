import { Search } from 'lucide-react'
import { useId, type ComponentProps } from 'react'

import { cn } from '@/utils/cn'

import styles from './search-field.module.css'

type SearchFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
}

export function SearchField({
  label,
  id,
  className,
  ...props
}: SearchFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn(styles.field, className)}>
      <Search size={18} strokeWidth={2} aria-hidden className={styles.icon} />
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input id={inputId} type="search" className={styles.input} {...props} />
    </div>
  )
}
