import { useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/layouts/auth-layout'
import { EmailVerificationStatus } from '@/features/auth/components/email-verification-status'

export function VerifyEmailRoute() {
  const [searchParams] = useSearchParams()

  return (
    <AuthLayout title="Verificação de e-mail">
      <EmailVerificationStatus token={searchParams.get('token')} />
    </AuthLayout>
  )
}
