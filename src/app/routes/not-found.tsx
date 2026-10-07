import { Link } from 'react-router'

import { paths } from '@/config/paths'

import styles from './not-found.module.css'

export function NotFoundRoute() {
  return (
    <main className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Página não encontrada</h1>
      <p className={styles.description}>O endereço acessado não existe.</p>
      <Link to={paths.home.getHref()} replace>
        Voltar ao início
      </Link>
    </main>
  )
}
