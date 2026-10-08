import { Check } from 'lucide-react'

import { cn } from '@/utils/cn'

import {
  getPasswordStrength,
  passwordRules,
  strengthLabels,
  strengthLevels,
} from '../utils/password-strength'
import styles from './password-strength.module.css'

type PasswordStrengthProps = {
  id: string
  password: string
}

const toneByLevel = ['', styles.weak, styles.fair, styles.good, styles.good]

export function PasswordStrength({ id, password }: PasswordStrengthProps) {
  const level = getPasswordStrength(password)

  return (
    <div id={id} className={styles.strength}>
      <div
        className={cn(styles.segments, toneByLevel[level])}
        aria-hidden="true"
      >
        {Array.from({ length: strengthLevels }, (_, index) => (
          <span key={index} className={styles.track}>
            {index < level ? (
              <span
                className={styles.fill}
                style={{ animationDelay: `${index * 0.08}s` }}
              />
            ) : null}
          </span>
        ))}
      </div>
      <div className={styles.caption}>
        <span>Força da senha</span>
        <span
          className={cn(styles.level, toneByLevel[level])}
          aria-live="polite"
        >
          {level ? strengthLabels[level] : '—'}
        </span>
      </div>
    </div>
  )
}

type PasswordRulesProps = {
  id: string
  password: string
}

export function PasswordRules({ id, password }: PasswordRulesProps) {
  return (
    <ul id={id} className={styles.rules}>
      {passwordRules.map((rule) => {
        const isMet = rule.test(password)
        return (
          <li key={rule.id} className={cn(styles.rule, isMet && styles.met)}>
            {isMet ? (
              <span className={styles.tick}>
                <Check size={13} strokeWidth={3} aria-hidden />
              </span>
            ) : (
              <span className={styles.pending} aria-hidden="true" />
            )}
            <span>
              {rule.label}
              <span className="sr-only">
                {isMet ? ', atendido' : ', pendente'}
              </span>
            </span>
            {rule.isRequired ? null : (
              <span className={styles.optional}>Recomendado</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
