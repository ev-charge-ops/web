import { KeyRound, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/layouts/auth-layout'
import { FullPageSpinner } from '@/components/layouts/full-page-spinner'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { paths } from '@/config/paths'
import { DriverAppNote } from '@/features/auth/components/driver-app-note'
import { EmailLoginForm } from '@/features/auth/components/email-login-form'
import { LoginForm } from '@/features/auth/components/login-form'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'
import { useAuth } from '@/lib/use-auth'

type LoginMethod = 'password' | 'email'

function getSafeRedirect(redirectTo: string | null) {
  if (redirectTo?.startsWith('/') && !redirectTo.startsWith('//')) {
    return redirectTo
  }
  return paths.home.getHref()
}

export function LoginRoute() {
  const { status } = useAuth()
  const [searchParams] = useSearchParams()
  const [method, setMethod] = useState<LoginMethod>('password')
  const redirectTo = getSafeRedirect(searchParams.get('redirectTo'))

  if (status === 'loading') {
    return <FullPageSpinner label="Restaurando sessão" />
  }

  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace />
  }

  const isPassword = method === 'password'

  return (
    <AuthLayout
      title="Entrar"
      description="Portal do gestor e do síndico"
      footer={
        <>
          <Link to={paths.legal.privacy.getHref()}>Política de Privacidade</Link>
          <Link to={paths.legal.terms.getHref()}>Termos de Uso</Link>
        </>
      }
    >
      {isPassword ? <LoginForm /> : <EmailLoginForm />}
      <Divider>ou</Divider>
      <OAuthButtons />
      <Button
        variant="ghost"
        icon={
          isPassword ? (
            <Mail size={16} strokeWidth={2} aria-hidden />
          ) : (
            <KeyRound size={16} strokeWidth={2} aria-hidden />
          )
        }
        onClick={() => setMethod(isPassword ? 'email' : 'password')}
      >
        {isPassword ? 'Receber link de acesso por e-mail' : 'Entrar com senha'}
      </Button>
      <DriverAppNote />
    </AuthLayout>
  )
}
