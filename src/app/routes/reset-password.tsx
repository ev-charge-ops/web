import { useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/layouts/auth-layout'
import {
  BackToLoginLink,
  InvalidResetLinkAlert,
  ResetPasswordForm,
} from '@/features/auth/components/reset-password-form'
import { passwordHighlights } from '@/features/auth/utils/password-strength'

export function ResetPasswordRoute() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <AuthLayout
      title="Redefinir senha"
      description="Escolha uma nova senha para acessar sua conta."
      headline="Sua senha protege o rateio de todo o condomínio."
      highlights={passwordHighlights}
      image="/media/points/charger-wall.webp"
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <>
          <InvalidResetLinkAlert />
          <BackToLoginLink />
        </>
      )}
    </AuthLayout>
  )
}
