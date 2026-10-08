import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { BackgroundVideo } from '@/components/ui/background-video'
import { Logo } from '@/components/ui/logo'
import { paths } from '@/config/paths'

import styles from './auth-layout.module.css'

type AuthLayoutProps = {
  title: string
  description?: ReactNode
  children: ReactNode
  headline?: string
  highlights?: string[]
  image?: string
}

const defaultHeadline = 'Cada kWh com dono, cada vaga livre a tempo.'

const footerLinks = [
  { href: paths.legal.support.getHref(), label: 'Suporte' },
  { href: paths.legal.privacy.getHref(), label: 'Privacidade' },
  { href: paths.legal.terms.getHref(), label: 'Termos' },
]

const defaultHighlights = [
  'Rateio por unidade',
  'Capacidade elétrica ao vivo',
  'Anomalias por IA',
]

export function AuthLayout({
  title,
  description,
  children,
  headline = defaultHeadline,
  highlights = defaultHighlights,
  image,
}: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.panel} aria-label="EV ChargeOps">
        <div className={styles.media}>
          {image ? (
            <img
              src={image}
              alt=""
              aria-hidden="true"
              className={styles.image}
            />
          ) : (
            <BackgroundVideo
              src="/media/garage-loop"
              className={styles.video}
            />
          )}
        </div>
        <div className={styles.shade} aria-hidden="true" />
        <Logo variant="inverse" size={40} className={styles.logo} />
        <div className={styles.pitch}>
          <p className={styles.headline}>{headline}</p>
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
          <footer className={styles.footer}>
            <nav aria-label="Links institucionais" className={styles.links}>
              {footerLinks.map((link) => (
                <Link key={link.href} to={link.href} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </footer>
        </div>
      </main>
    </div>
  )
}
