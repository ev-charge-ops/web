import { Mail } from 'lucide-react'
import { Navigate, useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/layouts/auth-layout'
import { FullPageSpinner } from '@/components/layouts/full-page-spinner'
import { Divider } from '@/components/ui/divider'
import { paths } from '@/config/paths'
import { AuthSwitchLink } from '@/features/auth/components/auth-switch-link'
import { DriverAppNote } from '@/features/auth/components/driver-app-note'
import { LoginForm } from '@/features/auth/components/login-form'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'
import { getSafeRedirect } from '@/features/auth/utils/redirect'
import { useAuth } from '@/lib/use-auth'

export function LoginRoute() {
  const { status } = useAuth()
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirectTo')
  const redirectTo = getSafeRedirect(redirectParam)

  if (status === 'loading') {
    return <FullPageSpinner label="Restaurando sessão" />
  }

  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <AuthLayout title="Entrar" description="Portal do gestor e do síndico">
      <LoginForm />
      <Divider>ou</Divider>
      <OAuthButtons />
      <AuthSwitchLink
        to={paths.auth.emailLogin.getHref(redirectParam)}
        icon={<Mail size={18} strokeWidth={2} aria-hidden />}
      >
        Receber link de acesso por e-mail
      </AuthSwitchLink>
      <DriverAppNote />
    </AuthLayout>
  )
}
