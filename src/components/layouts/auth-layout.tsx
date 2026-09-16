import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'

import styles from './auth-layout.module.css'

type AuthLayoutProps = {
  title: string
  description?: ReactNode
  children: ReactNode
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <span className={styles.brandName}>EV ChargeOps</span>
          <span className={styles.eyebrow}>Portal do condomínio</span>
        </div>
        <Card className={styles.card}>
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            {description ? (
              <p className={styles.description}>{description}</p>
            ) : null}
          </header>
          {children}
        </Card>
      </div>
    </main>
  )
}
