import type { ReactNode } from 'react'
import { Link } from 'react-router'

import styles from './auth-switch-link.module.css'

type AuthSwitchLinkProps = {
  to: string
  icon?: ReactNode
  children: ReactNode
}

export function AuthSwitchLink({ to, icon, children }: AuthSwitchLinkProps) {
  return (
    <Link to={to} className={styles.link}>
      {icon}
      {children}
    </Link>
  )
}
