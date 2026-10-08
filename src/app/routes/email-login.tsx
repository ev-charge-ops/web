import { LockKeyhole } from 'lucide-react'
import { Navigate, useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/layouts/auth-layout'
import { FullPageSpinner } from '@/components/layouts/full-page-spinner'
import { paths } from '@/config/paths'
import { AuthSwitchLink } from '@/features/auth/components/auth-switch-link'
import { EmailLoginForm } from '@/features/auth/components/email-login-form'
import { EmailLoginLink } from '@/features/auth/components/email-login-link'
import { getSafeRedirect } from '@/features/auth/utils/redirect'
import { useAuth } from '@/lib/use-auth'

const highlights = [
  'Código de uso único',
  'Válido por 10 minutos',
  'Enviado só para e-mails cadastrados',
]

export function EmailLoginRoute() {
  const { status } = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const redirectParam = searchParams.get('redirectTo')

  if (token) {
    return (
      <AuthLayout
        title="Entrar com link"
        headline="Acesso sem senha, com o mesmo cuidado."
        highlights={highlights}
      >
        <EmailLoginLink token={token} />
      </AuthLayout>
    )
  }

  if (status === 'loading') {
    return <FullPageSpinner label="Restaurando sessão" />
  }

  if (status === 'authenticated') {
    return <Navigate to={getSafeRedirect(redirectParam)} replace />
  }

  return (
    <AuthLayout
      title="Entrar com link"
      description="Receba um link e um código no seu e-mail. Use o que for mais prático."
      headline="Acesso sem senha, com o mesmo cuidado."
      highlights={highlights}
    >
      <EmailLoginForm />
      <AuthSwitchLink
        to={paths.auth.login.getHref(redirectParam)}
        icon={<LockKeyhole size={18} strokeWidth={2} aria-hidden />}
      >
        Usar senha
      </AuthSwitchLink>
    </AuthLayout>
  )
}
