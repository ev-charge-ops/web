import { CircleCheck, LogOut } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { paths } from '@/config/paths'
import { ApiError } from '@/lib/api-client'
import { useAuth } from '@/lib/use-auth'

import { useAcceptInviteAsCurrentUser } from '../api/accept-invite'
import { useInvitePreview, type InvitePreview } from '../api/get-invite-preview'
import {
  getUnavailableReason,
  hasErrorCode,
  isTooManyRequests,
  unavailableMessages,
  type UnavailableReason,
} from '../utils/error-messages'
import { AcceptInviteForm } from './accept-invite-form'
import { AppDownload } from './app-download'
import styles from './invite-acceptance.module.css'

type InviteAcceptanceProps = {
  token: string
  oauthButtons?: ReactNode
}

function InviteSummary({ preview }: { preview: InvitePreview }) {
  return (
    <dl className={styles.summary}>
      <div>
        <dt>Condomínio</dt>
        <dd>{preview.organizationName}</dd>
      </div>
      <div>
        <dt>E-mail</dt>
        <dd>{preview.email}</dd>
      </div>
      <div>
        <dt>Unidade</dt>
        <dd>{preview.unitLabel ?? '—'}</dd>
      </div>
    </dl>
  )
}

function Unavailable({ reason }: { reason: UnavailableReason }) {
  const { title, description } = unavailableMessages[reason]
  return (
    <div className={styles.result}>
      <h2 className={styles.resultTitle}>{title}</h2>
      <p className={styles.resultDescription}>{description}</p>
    </div>
  )
}

function getAuthenticatedErrorMessage(error: unknown) {
  if (hasErrorCode(error, 'INVITE_EMAIL_MISMATCH')) {
    return 'Este convite foi enviado para outro e-mail.'
  }
  if (isTooManyRequests(error)) {
    return 'Muitas tentativas, tente novamente em instantes.'
  }
  return 'Não foi possível aceitar o convite agora. Tente novamente em instantes.'
}

export function InviteAcceptance({ token, oauthButtons }: InviteAcceptanceProps) {
  const { status, user, signOut } = useAuth()
  const preview = useInvitePreview(token)
  const [result, setResult] = useState<'accepted' | 'member' | null>(null)
  const [unavailable, setUnavailable] = useState<UnavailableReason | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const markUnavailable = (error: unknown) => {
    const reason = getUnavailableReason(error)
    if (reason) setUnavailable(reason)
    return Boolean(reason)
  }

  const acceptAsCurrentUser = useAcceptInviteAsCurrentUser(token, {
    onSuccess: () => setResult('accepted'),
  })

  const loginHref = paths.auth.login.getHref(paths.invite.getHref(token))

  if (result) {
    return (
      <div className={styles.stack}>
        <Alert tone="success">
          {result === 'accepted'
            ? `Convite aceito! Você agora faz parte de ${preview.data?.organizationName ?? 'seu condomínio'}.`
            : 'Você já faz parte deste condomínio.'}
        </Alert>
        <AppDownload token={token} />
      </div>
    )
  }

  if (preview.isPending || status === 'loading') {
    return <Spinner label="Carregando convite" />
  }

  if (preview.error) {
    const notFound =
      preview.error instanceof ApiError && preview.error.status === 404
    return (
      <div className={styles.result}>
        <h2 className={styles.resultTitle}>
          {notFound ? 'Convite não encontrado' : 'Não foi possível abrir o convite'}
        </h2>
        <p className={styles.resultDescription}>
          {notFound
            ? 'Confira se você abriu o link completo enviado por e-mail.'
            : 'Tente novamente em instantes.'}
        </p>
      </div>
    )
  }

  const invite = preview.data
  const reason =
    unavailable ?? (invite.status === 'PENDING' ? null : invite.status)

  if (reason) {
    return <Unavailable reason={reason} />
  }

  if (user) {
    const isSameEmail = user.email.toLowerCase() === invite.email.toLowerCase()

    if (!isSameEmail) {
      return (
        <div className={styles.stack}>
          <InviteSummary preview={invite} />
          <Alert tone="info">
            Você está conectado como {user.email}. Saia e entre com{' '}
            {invite.email} para aceitar este convite.
          </Alert>
          <Button
            variant="secondary"
            icon={<LogOut size={16} strokeWidth={2} aria-hidden />}
            isLoading={isSigningOut}
            onClick={() => {
              setIsSigningOut(true)
              void signOut().finally(() => setIsSigningOut(false))
            }}
          >
            Sair e usar outra conta
          </Button>
        </div>
      )
    }

    return (
      <div className={styles.stack}>
        <InviteSummary preview={invite} />
        {acceptAsCurrentUser.error ? (
          <Alert>{getAuthenticatedErrorMessage(acceptAsCurrentUser.error)}</Alert>
        ) : null}
        <Button
          icon={<CircleCheck size={16} strokeWidth={2} aria-hidden />}
          isLoading={acceptAsCurrentUser.isPending}
          onClick={() =>
            acceptAsCurrentUser.mutate(undefined, {
              onError: (error) => {
                if (hasErrorCode(error, 'ALREADY_MEMBER')) setResult('member')
                else markUnavailable(error)
              },
            })
          }
        >
          Aceitar convite
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      <InviteSummary preview={invite} />
      <AcceptInviteForm
        token={token}
        email={invite.email}
        loginHref={loginHref}
        onAccepted={() => setResult('accepted')}
        onUnavailable={markUnavailable}
      />
      {oauthButtons ? (
        <>
          <div className={styles.divider}>ou</div>
          {oauthButtons}
        </>
      ) : null}
      <p className={styles.footnote}>
        Já tem conta? <Link to={loginHref}>Entrar para aceitar</Link>
      </p>
    </div>
  )
}
