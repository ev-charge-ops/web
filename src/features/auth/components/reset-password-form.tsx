import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { paths } from '@/config/paths'

import {
  resetPasswordInputSchema,
  useResetPassword,
  type ResetPasswordInput,
} from '../api/reset-password'
import {
  hasStatus,
  isRateLimited,
  tooManyRequestsMessage,
  unexpectedErrorMessage,
} from '../utils/error-messages'
import styles from './auth-form.module.css'

export function InvalidResetLinkAlert() {
  return (
    <Alert
      action={
        <Link to={paths.auth.forgotPassword.getHref()}>Solicitar novo link</Link>
      }
    >
      Este link de redefinição é inválido ou expirou.
    </Alert>
  )
}

type ResetPasswordFormProps = {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const resetPassword = useResetPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordInputSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  if (resetPassword.isSuccess) {
    return (
      <div className={styles.stack}>
        <Alert tone="success">
          Senha redefinida. Por segurança, encerramos as sessões abertas em
          todos os dispositivos.
        </Alert>
        <div className={styles.footer}>
          <Link to={paths.auth.login.getHref()}>Entrar com a nova senha</Link>
        </div>
      </div>
    )
  }

  const { error } = resetPassword
  const isInvalidToken = hasStatus(error, 400)

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={handleSubmit(({ password }) =>
        resetPassword.mutate({ token, password }),
      )}
    >
      {isInvalidToken ? <InvalidResetLinkAlert /> : null}
      {error && !isInvalidToken ? (
        <Alert>
          {isRateLimited(error) ? tooManyRequestsMessage : unexpectedErrorMessage}
        </Alert>
      ) : null}
      <TextField
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        hint="Use pelo menos 8 caracteres."
        error={errors.password?.message}
        {...register('password')}
      />
      <TextField
        label="Confirme a nova senha"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button
        type="submit"
        isLoading={resetPassword.isPending}
        className={styles.submit}
      >
        Redefinir senha
      </Button>
    </form>
  )
}
