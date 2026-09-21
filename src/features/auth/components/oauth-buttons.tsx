import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useLayoutEffect, useRef, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { env } from '@/config/env'
import { paths } from '@/config/paths'
import { AppleSignInCancelledError, signInWithApple } from '@/lib/apple-sign-in'

import { useAppleLogin, useGoogleLogin } from '../api/oauth-login'
import {
  hasStatus,
  isRateLimited,
  tooManyRequestsMessage,
  unexpectedErrorMessage,
} from '../utils/error-messages'
import styles from './oauth-buttons.module.css'

const googleButtonMaxWidth = 400

type Provider = 'Google' | 'Apple'

function getErrorMessage(error: unknown, provider: Provider) {
  if (hasStatus(error, 401)) {
    return `Não foi possível validar sua conta ${provider === 'Google' ? 'do Google' : 'da Apple'}.`
  }
  if (isRateLimited(error)) return tooManyRequestsMessage
  return unexpectedErrorMessage
}

function AppleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 814 1000" aria-hidden>
      <path
        fill="currentColor"
        d="M788 341c-6 4-108 62-108 190 0 149 131 201 135 203-1 3-21 72-69 142-43 62-88 124-156 124s-86-40-164-40c-77 0-104 41-167 41s-106-58-156-128C45 791 0 666 0 548c0-190 123-290 245-290 65 0 119 43 160 43 39 0 100-45 174-45 28 0 129 2 196 97zM559 165c31-36 52-87 52-138 0-7-1-14-2-20-50 2-109 33-145 74-28 32-54 83-54 135 0 8 1 16 2 18 3 1 9 2 14 2 45 0 101-30 133-71z"
      />
    </svg>
  )
}

function GoogleButton({ clientId }: { clientId: string }) {
  const googleLogin = useGoogleLogin()
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(googleButtonMaxWidth)
  const [hasSdkError, setHasSdkError] = useState(false)

  useLayoutEffect(() => {
    const measured = containerRef.current?.clientWidth
    if (measured) setWidth(Math.min(measured, googleButtonMaxWidth))
  }, [])

  const error = googleLogin.error
    ? getErrorMessage(googleLogin.error, 'Google')
    : hasSdkError
      ? 'Não foi possível entrar com o Google. Tente novamente.'
      : null

  return (
    <div className={styles.provider}>
      {error ? <Alert>{error}</Alert> : null}
      <div ref={containerRef} className={styles.google}>
        <GoogleOAuthProvider clientId={clientId} locale="pt-BR">
          <GoogleLogin
            text="continue_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width={width}
            onSuccess={({ credential }) => {
              setHasSdkError(false)
              if (credential) googleLogin.mutate({ idToken: credential })
              else setHasSdkError(true)
            }}
            onError={() => setHasSdkError(true)}
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  )
}

function AppleButton({ servicesId }: { servicesId: string }) {
  const appleLogin = useAppleLogin()
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [hasSdkError, setHasSdkError] = useState(false)

  const handleClick = async () => {
    setHasSdkError(false)
    appleLogin.reset()
    setIsAuthorizing(true)
    try {
      const { identityToken, givenName, familyName } = await signInWithApple({
        clientId: servicesId,
        redirectUri: new URL(
          paths.auth.appleCallback.getHref(),
          window.location.origin,
        ).toString(),
      })
      appleLogin.mutate({
        identityToken,
        ...(givenName || familyName
          ? { fullName: { givenName, familyName } }
          : {}),
      })
    } catch (error) {
      if (!(error instanceof AppleSignInCancelledError)) setHasSdkError(true)
    } finally {
      setIsAuthorizing(false)
    }
  }

  const error = appleLogin.error
    ? getErrorMessage(appleLogin.error, 'Apple')
    : hasSdkError
      ? 'Não foi possível entrar com a Apple. Tente novamente.'
      : null

  return (
    <div className={styles.provider}>
      {error ? <Alert>{error}</Alert> : null}
      <Button
        variant="outline"
        className={styles.apple}
        icon={<AppleLogo />}
        isLoading={isAuthorizing || appleLogin.isPending}
        onClick={() => void handleClick()}
      >
        Continuar com a Apple
      </Button>
    </div>
  )
}

export function OAuthButtons() {
  const { googleClientId, appleServicesId } = env

  if (!googleClientId && !appleServicesId) return null

  return (
    <div className={styles.buttons}>
      {googleClientId ? <GoogleButton clientId={googleClientId} /> : null}
      {appleServicesId ? <AppleButton servicesId={appleServicesId} /> : null}
    </div>
  )
}
