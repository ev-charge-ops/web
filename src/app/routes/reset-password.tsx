import { useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/layouts/auth-layout'
import {
  InvalidResetLinkAlert,
  ResetPasswordForm,
} from '@/features/auth/components/reset-password-form'

export function ResetPasswordRoute() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <AuthLayout
      title="Criar nova senha"
      description="Escolha uma nova senha para acessar sua conta."
    >
      {token ? <ResetPasswordForm token={token} /> : <InvalidResetLinkAlert />}
    </AuthLayout>
  )
}
