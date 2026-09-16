import { createContext, useContext } from 'react'

import type { components } from './api-schema'

export type AuthUser = components['schemas']['UserResponseDto']

export type AuthSession = components['schemas']['AuthResponseDto']

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  signIn: (session: AuthSession) => void
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
