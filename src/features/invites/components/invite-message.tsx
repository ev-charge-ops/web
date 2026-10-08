import type { ReactNode } from 'react'

import styles from './invite-acceptance.module.css'

type InviteMessageProps = {
  title: string
  description: ReactNode
  children?: ReactNode
}

export function InviteMessage({
  title,
  description,
  children,
}: InviteMessageProps) {
  return (
    <div className={styles.message}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      {children}
    </div>
  )
}
