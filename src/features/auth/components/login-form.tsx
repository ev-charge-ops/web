import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { ApiError } from '@/lib/api-client'
import type { AuthSession } from '@/lib/use-auth'

import { loginInputSchema, useLogin, type LoginInput } from '../api/login'
import styles from './login-form.module.css'

type LoginFormProps = {
  onSuccess?: (session: AuthSession) => void
}

function getErrorMessage(error: Error) {
  if (error instanceof ApiError && error.status === 401) {
    return 'E-mail ou senha inválidos'
  }
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
      {login.error ? (
        <div role="alert" className={styles.error}>
          <CircleAlert size={16} strokeWidth={2} aria-hidden />
          <span>{getErrorMessage(login.error)}</span>
        </div>
      ) : null}
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
      <Button type="submit" isLoading={login.isPending} className={styles.submit}>
        Entrar
      </Button>
    </form>
  )
}
