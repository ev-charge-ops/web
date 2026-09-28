import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'

import styles from './auth-layout.module.css'

type AuthLayoutProps = {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <Logo size={44} className={styles.logo} />
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
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </main>
  )
}
