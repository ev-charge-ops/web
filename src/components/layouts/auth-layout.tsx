import type { ReactNode } from 'react'

import { BackgroundVideo } from '@/components/ui/background-video'
import { Logo } from '@/components/ui/logo'

import styles from './auth-layout.module.css'

type AuthLayoutProps = {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

const highlights = [
  'Rateio por unidade',
  'Capacidade elétrica ao vivo',
  'Anomalias por IA',
]

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.panel} aria-label="EV ChargeOps">
        <div className={styles.media}>
          <BackgroundVideo src="/media/garage-loop" className={styles.video} />
        </div>
        <div className={styles.shade} aria-hidden="true" />
        <Logo variant="inverse" size={40} className={styles.logo} />
        <div className={styles.pitch}>
          <p className={styles.headline}>
            Cada kWh com dono, cada vaga livre a tempo.
          </p>
          <ul className={styles.chips}>
            {highlights.map((highlight) => (
              <li key={highlight} className={styles.chip}>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            {description ? (
              <p className={styles.description}>{description}</p>
            ) : null}
          </header>
          {children}
          {footer ? <footer className={styles.footer}>{footer}</footer> : null}
        </div>
      </main>
    </div>
  )
}
