import { useQueryClient } from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { publicApiClient, setAuthHandlers } from './api-client'
import {
  AuthContext,
  type AuthContextValue,
  type AuthSession,
  type AuthUser,
} from './use-auth'

export const refreshTokenStorageKey = 'ev-charge-ops:refresh-token'

function readRefreshToken() {
  try {
    return localStorage.getItem(refreshTokenStorageKey)
  } catch {
    return null
  }
}

function writeRefreshToken(token: string | null) {
  try {
    if (token) localStorage.setItem(refreshTokenStorageKey, token)
    else localStorage.removeItem(refreshTokenStorageKey)
  } catch {
    return
  }
}

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'anonymous'; user: null }
  | { status: 'authenticated'; user: AuthUser }

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const accessTokenRef = useRef<string | null>(null)
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null)
  const hasRestoredRef = useRef(false)
  const [state, setState] = useState<AuthState>(() =>
    readRefreshToken()
      ? { status: 'loading', user: null }
      : { status: 'anonymous', user: null },
  )

  const signIn = useCallback((session: AuthSession) => {
    accessTokenRef.current = session.accessToken
    writeRefreshToken(session.refreshToken)
    setState({ status: 'authenticated', user: session.user })
  }, [])

  const clearSession = useCallback(() => {
    accessTokenRef.current = null
    writeRefreshToken(null)
    queryClient.clear()
    setState({ status: 'anonymous', user: null })
  }, [queryClient])

  const refreshSession = useCallback(() => {
    refreshInFlightRef.current ??= (async () => {
      const refreshToken = readRefreshToken()
      if (!refreshToken) return null
      const { data } = await publicApiClient.POST('/auth/refresh', {
        body: { refreshToken },
      })
      if (!data) return null
      signIn(data)
      return data.accessToken
    })()
      .catch(() => null)
      .finally(() => {
        refreshInFlightRef.current = null
      })
    return refreshInFlightRef.current
  }, [signIn])

  const signOut = useCallback(async () => {
    const refreshToken = readRefreshToken()
    if (refreshToken) {
      await publicApiClient
        .POST('/auth/logout', { body: { refreshToken } })
        .catch(() => undefined)
    }
    clearSession()
  }, [clearSession])

  useEffect(() => {
    setAuthHandlers({
      getAccessToken: () => accessTokenRef.current,
      refreshAccessToken: refreshSession,
      onRefreshFailure: clearSession,
    })
    return () => setAuthHandlers(null)
  }, [refreshSession, clearSession])

  useEffect(() => {
    if (hasRestoredRef.current) return
    hasRestoredRef.current = true
    if (!readRefreshToken()) return
    void refreshSession().then((token) => {
      if (!token) clearSession()
    })
  }, [refreshSession, clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signOut }),
    [state, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
