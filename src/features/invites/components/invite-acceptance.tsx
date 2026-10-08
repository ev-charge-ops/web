import { CircleCheck, ExternalLink, LogOut } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { paths } from '@/config/paths'
import { ApiError } from '@/lib/api-client'
import { useAuth } from '@/lib/use-auth'

import { useAcceptInviteAsCurrentUser } from '../api/accept-invite'
import { useInvitePreview } from '../api/get-invite-preview'
import {
  getUnavailableReason,
  hasErrorCode,
  isTooManyRequests,
  unavailableMessages,
  type UnavailableReason,
} from '../utils/error-messages'
import { AcceptInviteForm } from './accept-invite-form'
import styles from './invite-acceptance.module.css'
import { InviteHeader } from './invite-header'
import { InviteMessage } from './invite-message'

type InviteAcceptanceProps = {
  token: string
  oauthButtons?: ReactNode
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

export function InviteAcceptance({
  token,
  oauthButtons,
}: InviteAcceptanceProps) {
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
      <InviteMessage
        title={result === 'accepted' ? 'Convite aceito' : 'Você já é morador'}
        description={
          result === 'accepted'
            ? `Você agora faz parte de ${preview.data?.organizationName ?? 'seu condomínio'}.`
            : 'Você já faz parte deste condomínio.'
        }
      >
        <p className={styles.description}>
          As recargas e o seu consumo ficam no app. Entre com a mesma conta que
          você acabou de usar.
        </p>
        <a
          className={styles.openApp}
          href={`evchargeops://invite?token=${encodeURIComponent(token)}`}
        >
          <ExternalLink size={16} strokeWidth={2} aria-hidden />
          Abrir no app
        </a>
      </InviteMessage>
    )
  }

  if (preview.isPending || status === 'loading') {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" label="Carregando convite" />
      </div>
    )
  }

  if (preview.error) {
    const notFound =
      preview.error instanceof ApiError && preview.error.status === 404
    return (
      <InviteMessage
        title={
          notFound
            ? 'Convite não encontrado'
            : 'Não foi possível abrir o convite'
        }
        description={
          notFound
            ? 'Confira se você abriu o link completo enviado por e-mail.'
            : 'Tente novamente em instantes.'
        }
      />
    )
  }

  const invite = preview.data
  const reason =
    unavailable ?? (invite.status === 'PENDING' ? null : invite.status)

  if (reason) {
    const { title, description } = unavailableMessages[reason]
    return <InviteMessage title={title} description={description} />
  }

  if (user) {
    const isSameEmail = user.email.toLowerCase() === invite.email.toLowerCase()

    if (!isSameEmail) {
      return (
        <>
          <InviteHeader preview={invite} />
          <div className={styles.form}>
            <Alert tone="info">
              Você está conectado como {user.email}. Saia e entre com{' '}
              {invite.email} para aceitar este convite.
            </Alert>
            <Button
              variant="secondary"
              size="lg"
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
        </>
      )
    }

    return (
      <>
        <InviteHeader preview={invite} />
        <div className={styles.form}>
          {acceptAsCurrentUser.error ? (
            <Alert>
              {getAuthenticatedErrorMessage(acceptAsCurrentUser.error)}
            </Alert>
          ) : null}
          <Button
            size="lg"
            icon={<CircleCheck size={18} strokeWidth={2} aria-hidden />}
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
      </>
    )
  }

  return (
    <>
      <InviteHeader preview={invite} />
      <AcceptInviteForm
        token={token}
        email={invite.email}
        loginHref={loginHref}
        oauthButtons={oauthButtons}
        onAccepted={() => setResult('accepted')}
        onUnavailable={markUnavailable}
      />
    </>
  )
}
