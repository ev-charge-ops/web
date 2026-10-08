import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'

import {
  acceptInviteInputSchema,
  useAcceptInvite,
  type AcceptInviteInput,
} from '../api/accept-invite'
import { hasErrorCode, isTooManyRequests } from '../utils/error-messages'
import styles from './invite-acceptance.module.css'

type AcceptInviteFormProps = {
  token: string
  email: string
  loginHref: string
  onAccepted: () => void
  onUnavailable: (error: unknown) => boolean
}

export function AcceptInviteForm({
  token,
  email,
  loginHref,
  onAccepted,
  onUnavailable,
}: AcceptInviteFormProps) {
  const acceptInvite = useAcceptInvite(token, { onSuccess: onAccepted })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteInputSchema),
    defaultValues: { name: '', password: '' },
  })

  const error = acceptInvite.error

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={handleSubmit((values) =>
        acceptInvite.mutate(values, { onError: onUnavailable }),
      )}
    >
      {error && hasErrorCode(error, 'EMAIL_ALREADY_REGISTERED') ? (
        <Alert tone="info" action={<Link to={loginHref}>Entrar na minha conta</Link>}>
          Este e-mail já tem uma conta. Entre com ela para aceitar o convite.
        </Alert>
      ) : error ? (
        <Alert>
          {isTooManyRequests(error)
            ? 'Muitas tentativas, tente novamente em instantes.'
            : 'Não foi possível aceitar o convite agora. Tente novamente em instantes.'}
        </Alert>
      ) : null}
      <input
        type="email"
        name="email"
        autoComplete="username"
        value={email}
        readOnly
        hidden
      />
      <TextField
        label="Seu nome"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Crie uma senha"
        type="password"
        autoComplete="new-password"
        hint="Pelo menos 8 caracteres."
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" size="lg" isLoading={acceptInvite.isPending}>
        Criar conta e aceitar convite
      </Button>
    </form>
  )
}
