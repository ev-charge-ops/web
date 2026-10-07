import { useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/layouts/auth-layout'
import { EmailLoginLink } from '@/features/auth/components/email-login-link'

export function EmailLoginRoute() {
  const [searchParams] = useSearchParams()

  return (
    <AuthLayout title="Entrar com link de acesso">
      <EmailLoginLink token={searchParams.get('token')} />
    </AuthLayout>
  )
}
