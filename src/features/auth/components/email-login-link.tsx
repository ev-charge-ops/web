import { useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { paths } from '@/config/paths'

import { useVerifyEmailLogin } from '../api/email-login'
import {
  hasStatus,
  isRateLimited,
  tooManyRequestsMessage,
  unexpectedErrorMessage,
} from '../utils/error-messages'
import styles from './auth-form.module.css'

const invalidLinkMessage =
  'Este link de acesso é inválido ou expirou. Volte ao login para receber um novo.'

type EmailLoginLinkProps = {
  token: string | null
}

export function EmailLoginLink({ token }: EmailLoginLinkProps) {
  const { mutate, isSuccess, error } = useVerifyEmailLogin()
  const requestedTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!token || requestedTokenRef.current === token) return
    requestedTokenRef.current = token
    mutate({ token })
  }, [token, mutate])

  if (isSuccess) {
    return <Navigate to={paths.home.getHref()} replace />
  }

  if (!token || error) {
    const message =
      !token || hasStatus(error, 401) || hasStatus(error, 400)
        ? invalidLinkMessage
        : isRateLimited(error)
          ? tooManyRequestsMessage
          : unexpectedErrorMessage
    return (
      <div className={styles.stack}>
        <Alert>{message}</Alert>
        <div className={styles.footer}>
          <Link to={paths.auth.login.getHref()}>Voltar para o login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.footer}>
      <Spinner size="lg" label="Entrando no portal" />
    </div>
  )
}
