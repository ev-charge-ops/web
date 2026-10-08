import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { PasswordField } from '@/components/ui/password-field'
import { TextField } from '@/components/ui/text-field'
import { paths } from '@/config/paths'

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
  oauthButtons?: ReactNode
  onAccepted: () => void
  onUnavailable: (error: unknown) => boolean
}

export function AcceptInviteForm({
  token,
  email,
  loginHref,
  oauthButtons,
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
        <Alert
          tone="info"
          action={<Link to={loginHref}>Entrar na minha conta</Link>}
        >
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
        label="Nome completo"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <PasswordField
        label="Senha"
        labelAction={<span className={styles.fieldEmail}>{email}</span>}
        autoComplete="new-password"
        placeholder="Crie uma senha com 8 caracteres ou mais"
        error={errors.password?.message}
        {...register('password')}
      />
      {oauthButtons ? (
        <>
          <Divider>ou continue com</Divider>
          <div className={styles.oauth}>{oauthButtons}</div>
        </>
      ) : null}
      <Button
        type="submit"
        size="lg"
        isLoading={acceptInvite.isPending}
        className={styles.submit}
      >
        Aceitar convite
      </Button>
      <p className={styles.terms}>
        Ao aceitar, você concorda com os{' '}
        <Link to={paths.legal.terms.getHref()}>Termos de uso</Link> e a{' '}
        <Link to={paths.legal.privacy.getHref()}>Política de privacidade</Link>.
      </p>
      <p className={styles.terms}>
        Já tem conta? <Link to={loginHref}>Entrar para aceitar</Link>
      </p>
    </form>
  )
}
