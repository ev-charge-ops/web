import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'

import {
  forgotPasswordInputSchema,
  useForgotPassword,
  type ForgotPasswordInput,
} from '../api/forgot-password'
import {
  isRateLimited,
  tooManyRequestsMessage,
  unexpectedErrorMessage,
} from '../utils/error-messages'
import styles from './password-forms.module.css'
import { BackToLoginLink, ResetLinkNotice } from './reset-password-form'

export const forgotPasswordSuccessMessage =
  'Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha. Confira sua caixa de entrada e o spam.'

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordInputSchema),
    defaultValues: { email: '' },
  })

  if (forgotPassword.isSuccess) {
    return (
      <>
        <Alert tone="success">{forgotPasswordSuccessMessage}</Alert>
        <ResetLinkNotice />
        <BackToLoginLink />
      </>
    )
  }

  return (
    <>
      <form
        className={styles.form}
        noValidate
        onSubmit={handleSubmit((values) => forgotPassword.mutate(values))}
      >
        {forgotPassword.error ? (
          <Alert>
            {isRateLimited(forgotPassword.error)
              ? tooManyRequestsMessage
              : unexpectedErrorMessage}
          </Alert>
        ) : null}
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="gestor@condominio.com.br"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button
          type="submit"
          size="lg"
          isLoading={forgotPassword.isPending}
          className={styles.submit}
        >
          Enviar link
        </Button>
      </form>
      <ResetLinkNotice />
      <BackToLoginLink />
    </>
  )
}
