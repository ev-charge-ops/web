import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { paths } from '@/config/paths'

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
import styles from './auth-form.module.css'

export const forgotPasswordSuccessMessage =
  'Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha. Confira sua caixa de entrada e o spam.'

function BackToLoginLink() {
  return (
    <div className={styles.footer}>
      <Link to={paths.auth.login.getHref()}>Voltar para o login</Link>
    </div>
  )
}

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
      <div className={styles.stack}>
        <Alert tone="success">{forgotPasswordSuccessMessage}</Alert>
        <BackToLoginLink />
      </div>
    )
  }

  return (
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
        placeholder="voce@condominio.com.br"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button
        type="submit"
        isLoading={forgotPassword.isPending}
        className={styles.submit}
      >
        Enviar link
      </Button>
      <BackToLoginLink />
    </form>
  )
}
