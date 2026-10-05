import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { Logo } from '@/components/ui/logo'
import { paths } from '@/config/paths'

import styles from './not-found.module.css'

export function NotFoundRoute() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <Link
        to={paths.home.getHref()}
        className={styles.brand}
        aria-label="EV ChargeOps, visão geral"
      >
        <Logo size={32} />
      </Link>
      <main className={styles.main}>
        <div role="img" aria-label="Erro 404" className={styles.code}>
          <span aria-hidden="true">4</span>
          <svg
            aria-hidden="true"
            viewBox="10 10 44 44"
            className={styles.mark}
            focusable="false"
          >
            <path
              className={styles.ring}
              d="M45.02 42.93 A17 17 0 1 1 45.02 21.07"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              className={styles.bolt}
              d="M34 20 L24 34 H31 L29 44 L40 29 H33 Z"
            />
            <circle className={styles.halo} cx="45.02" cy="21.07" r="3.8" />
            <circle className={styles.node} cx="45.02" cy="21.07" r="3.8" />
          </svg>
          <span aria-hidden="true">4</span>
        </div>
        <div className={styles.copy}>
          <h1 className={styles.title}>Página não encontrada</h1>
          <p className={styles.description}>
            O endereço pode ter mudado ou a página foi removida.
          </p>
        </div>
        <div className={styles.actions}>
          <Link to={paths.home.getHref()} replace className={styles.primary}>
            <LayoutDashboard size={20} strokeWidth={2} aria-hidden />
            Ir para a visão geral
          </Link>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => void navigate(-1)}
          >
            <ArrowLeft size={20} strokeWidth={2} aria-hidden />
            Voltar à página anterior
          </button>
        </div>
      </main>
      <p className={styles.footer}>
        Código do erro <span className={styles.mono}>404 · NOT_FOUND</span>
      </p>
    </div>
  )
}
