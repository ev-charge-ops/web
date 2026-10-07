import { AuthLayout } from '@/components/layouts/auth-layout'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export function ForgotPasswordRoute() {
  return (
    <AuthLayout
      title="Esqueci minha senha"
      description="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
