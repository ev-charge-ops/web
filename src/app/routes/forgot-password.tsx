import { AuthLayout } from '@/components/layouts/auth-layout'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import { passwordHighlights } from '@/features/auth/utils/password-strength'

export function ForgotPasswordRoute() {
  return (
    <AuthLayout
      title="Esqueci a senha"
      description="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
      headline="Sua senha protege o rateio de todo o condomínio."
      highlights={passwordHighlights}
      image="/media/points/charger-wall.webp"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
