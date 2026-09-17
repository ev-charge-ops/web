import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { paths } from '@/config/paths'
import type { AuthSession } from '@/lib/use-auth'

import { loginInputSchema, useLogin, type LoginInput } from '../api/login'
import {
  hasStatus,
  isRateLimited,
  tooManyRequestsMessage,
} from '../utils/error-messages'
import styles from './login-form.module.css'

type LoginFormProps = {
  onSuccess?: (session: AuthSession) => void
}

function getErrorMessage(error: Error) {
  if (hasStatus(error, 401)) return 'E-mail ou senha inválidos'
  if (isRateLimited(error)) return tooManyRequestsMessage
  return 'Não foi possível entrar agora. Tente novamente em instantes.'
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin({ onSuccess })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={handleSubmit((values) => login.mutate(values))}
    >
      {login.error ? <Alert>{getErrorMessage(login.error)}</Alert> : null}
      <TextField
        label="E-mail"
        type="email"
        autoComplete="username"
        placeholder="voce@condominio.com.br"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Senha"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <div className={styles.forgot}>
        <Link to={paths.auth.forgotPassword.getHref()}>Esqueci minha senha</Link>
      </div>
      <Button type="submit" isLoading={login.isPending} className={styles.submit}>
        Entrar
      </Button>
    </form>
  )
}
