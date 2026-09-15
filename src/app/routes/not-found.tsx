import { Link } from 'react-router'

import { paths } from '@/config/paths'

export function NotFoundRoute() {
  return (
    <main>
      <h1>Página não encontrada</h1>
      <p>O endereço acessado não existe.</p>
      <Link to={paths.home.getHref()} replace>
        Voltar ao início
      </Link>
    </main>
  )
}
