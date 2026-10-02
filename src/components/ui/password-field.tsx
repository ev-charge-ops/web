import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps } from 'react'

import styles from './password-field.module.css'
import { TextField } from './text-field'

type PasswordFieldProps = Omit<
  ComponentProps<typeof TextField>,
  'type' | 'trailing'
>

export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const Icon = isVisible ? EyeOff : Eye

  return (
    <TextField
      {...props}
      type={isVisible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className={styles.toggle}
          aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
        >
          <Icon size={20} strokeWidth={2} aria-hidden />
        </button>
      }
    />
  )
}
