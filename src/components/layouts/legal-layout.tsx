import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { paths } from '@/config/paths'

import styles from './legal-layout.module.css'

type LegalLayoutProps = {
  title: string
  updatedAt: string
  children: ReactNode
}

export function LegalLayout({ title, updatedAt, children }: LegalLayoutProps) {
  return (
    <main className={styles.page}>
      <article className={styles.content}>
        <header className={styles.header}>
          <Link to={paths.auth.login.getHref()} className={styles.brand}>
            EV ChargeOps
          </Link>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.updated}>Última atualização: {updatedAt}</p>
        </header>
        <div className={styles.body}>{children}</div>
        <footer className={styles.footer}>
          <Link to={paths.legal.privacy.getHref()}>Política de Privacidade</Link>
          <Link to={paths.legal.terms.getHref()}>Termos de Uso</Link>
          <Link to={paths.auth.login.getHref()}>Voltar ao login</Link>
        </footer>
      </article>
    </main>
  )
}
