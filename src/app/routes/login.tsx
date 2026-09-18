import { KeyRound, Mail } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/layouts/auth-layout'
import { FullPageSpinner } from '@/components/layouts/full-page-spinner'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'
import { EmailLoginForm } from '@/features/auth/components/email-login-form'
import { LoginForm } from '@/features/auth/components/login-form'
import { useAuth } from '@/lib/use-auth'

import styles from './login.module.css'

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
      title="Entrar no portal"
      description="Acesso exclusivo para gestores do condomínio."
    >
      {isPassword ? <LoginForm /> : <EmailLoginForm />}
      <div className={styles.divider}>ou</div>
      <Button
        variant="outline"
        icon={
          isPassword ? (
            <Mail size={16} strokeWidth={2} aria-hidden />
          ) : (
            <KeyRound size={16} strokeWidth={2} aria-hidden />
          )
        }
        onClick={() => setMethod(isPassword ? 'email' : 'password')}
      >
        {isPassword ? 'Entrar com código por e-mail' : 'Entrar com senha'}
      </Button>
    </AuthLayout>
  )
}
