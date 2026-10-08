import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Clock } from 'lucide-react'
import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PasswordField } from '@/components/ui/password-field'
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
import { PasswordRules, PasswordStrength } from './password-strength'
import styles from './password-forms.module.css'

export function InvalidResetLinkAlert() {
  return (
    <Alert
      action={
        <Link to={paths.auth.forgotPassword.getHref()}>
          Solicitar novo link
        </Link>
      }
    >
      Este link de redefinição é inválido ou expirou.
    </Alert>
  )
}

export function ResetLinkNotice() {
  return (
    <p className={styles.notice}>
      <Clock size={18} strokeWidth={2} aria-hidden />O link vale por 30 minutos
      e só pode ser usado uma vez.
    </p>
  )
}

export function BackToLoginLink() {
  return (
    <Link to={paths.auth.login.getHref()} className={styles.back}>
      Voltar para entrar
    </Link>
  )
}

type ResetPasswordFormProps = {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const strengthId = useId()
  const rulesId = useId()
  const matchId = useId()
  const resetPassword = useResetPassword()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordInputSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const [password, confirmPassword] = useWatch({
    control,
    name: ['password', 'confirmPassword'],
  })

  if (resetPassword.isSuccess) {
    return (
      <>
        <Alert tone="success">
          Senha redefinida. Por segurança, encerramos as sessões abertas em
          todos os dispositivos.
        </Alert>
        <Link to={paths.auth.login.getHref()} className={styles.back}>
          Entrar com a nova senha
        </Link>
      </>
    )
  }

  const { error } = resetPassword
  const isInvalidToken = hasStatus(error, 400)
  const passwordsMatch =
    Boolean(confirmPassword) && password === confirmPassword

  return (
    <>
      <form
        className={styles.form}
        noValidate
        onSubmit={handleSubmit(({ password: value }) =>
          resetPassword.mutate({ token, password: value }),
        )}
      >
        {isInvalidToken ? <InvalidResetLinkAlert /> : null}
        {error && !isInvalidToken ? (
          <Alert>
            {isRateLimited(error)
              ? tooManyRequestsMessage
              : unexpectedErrorMessage}
          </Alert>
        ) : null}
        <PasswordField
          label="Nova senha"
          autoComplete="new-password"
          aria-describedby={`${strengthId} ${rulesId}`}
          error={errors.password?.message}
          footer={<PasswordStrength id={strengthId} password={password} />}
          {...register('password')}
        />
        <PasswordRules id={rulesId} password={password} />
        <PasswordField
          label="Confirmar nova senha"
          autoComplete="new-password"
          aria-describedby={passwordsMatch ? matchId : undefined}
          error={errors.confirmPassword?.message}
          footer={
            passwordsMatch && !errors.confirmPassword ? (
              <span id={matchId} className={styles.match}>
                <Check size={14} strokeWidth={2.5} aria-hidden />
                As senhas coincidem
              </span>
            ) : null
          }
          {...register('confirmPassword')}
        />
        <Button
          type="submit"
          size="lg"
          isLoading={resetPassword.isPending}
          className={styles.submit}
        >
          Salvar nova senha
        </Button>
      </form>
      <ResetLinkNotice />
      <BackToLoginLink />
    </>
  )
}
