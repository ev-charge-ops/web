import { useEffect, useRef } from 'react'
import { Link } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { paths } from '@/config/paths'
import { useAuth } from '@/lib/use-auth'

import { useConfirmEmailVerification } from '../api/confirm-email-verification'
import { useRefreshMe } from '../api/get-me'
import {
  hasStatus,
  isRateLimited,
  tooManyRequestsMessage,
  unexpectedErrorMessage,
} from '../utils/error-messages'
import styles from './auth-form.module.css'

const invalidLinkMessage =
  'Este link de verificação é inválido ou expirou. Solicite um novo e-mail de verificação pelo portal ou pelo aplicativo.'

function ContinueLink() {
  const { status } = useAuth()
  return (
    <div className={styles.footer}>
      {status === 'authenticated' ? (
        <Link to={paths.home.getHref()}>Ir para o portal</Link>
      ) : (
        <Link to={paths.auth.login.getHref()}>Ir para o login</Link>
      )}
    </div>
  )
}

type EmailVerificationStatusProps = {
  token: string | null
}

export function EmailVerificationStatus({ token }: EmailVerificationStatusProps) {
  const { status } = useAuth()
  const refreshMe = useRefreshMe()
  const { mutate, isSuccess, error } = useConfirmEmailVerification()
  const requestedTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!token || requestedTokenRef.current === token) return
    requestedTokenRef.current = token
    mutate(token)
  }, [token, mutate])

  useEffect(() => {
    if (isSuccess && status === 'authenticated') {
      refreshMe().catch(() => undefined)
    }
  }, [isSuccess, status, refreshMe])

  if (isSuccess) {
    return (
      <div className={styles.stack}>
        <Alert tone="success">
          E-mail confirmado. Você já pode usar o portal ou o aplicativo EV
          ChargeOps.
        </Alert>
        <ContinueLink />
      </div>
    )
  }

  if (!token || error) {
    const message =
      !token || hasStatus(error, 400)
        ? invalidLinkMessage
        : isRateLimited(error)
          ? tooManyRequestsMessage
          : unexpectedErrorMessage
    return (
      <div className={styles.stack}>
        <Alert>{message}</Alert>
        <ContinueLink />
      </div>
    )
  }

  return (
    <div className={styles.footer}>
      <Spinner size="lg" label="Confirmando seu e-mail" />
    </div>
  )
}
