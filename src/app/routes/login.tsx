import { Navigate, useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/layouts/auth-layout'
import { FullPageSpinner } from '@/components/layouts/full-page-spinner'
import { paths } from '@/config/paths'
import { LoginForm } from '@/features/auth/components/login-form'
import { useAuth } from '@/lib/use-auth'

function getSafeRedirect(redirectTo: string | null) {
  if (redirectTo?.startsWith('/') && !redirectTo.startsWith('//')) {
    return redirectTo
  }
  return paths.home.getHref()
}

export function LoginRoute() {
  const { status } = useAuth()
  const [searchParams] = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get('redirectTo'))

  if (status === 'loading') {
    return <FullPageSpinner label="Restaurando sessão" />
  }

  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <AuthLayout
      title="Entrar no portal"
      description="Acesso exclusivo para gestores do condomínio."
    >
      <LoginForm />
    </AuthLayout>
  )
}
