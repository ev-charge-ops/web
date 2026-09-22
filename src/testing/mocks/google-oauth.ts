import type { UseGoogleLoginOptionsAuthCodeFlow } from '@react-oauth/google'
import type { ReactNode } from 'react'
import { vi } from 'vitest'

export const googleAuthCode = 'google-auth-code'

function grantCode(options: UseGoogleLoginOptionsAuthCodeFlow) {
  options.onSuccess?.({ code: googleAuthCode, scope: 'openid email profile' })
}

export const googleOAuth = {
  scriptLoaded: true,
  requestCode: vi.fn(grantCode),
}

export function resetGoogleOAuth() {
  googleOAuth.scriptLoaded = true
  googleOAuth.requestCode.mockReset()
  googleOAuth.requestCode.mockImplementation(grantCode)
}

export function GoogleOAuthProvider({ children }: { children: ReactNode }) {
  return children
}

export function useGoogleOAuth() {
  return {
    clientId: 'google-client-id',
    scriptLoadedSuccessfully: googleOAuth.scriptLoaded,
  }
}

export function useGoogleLogin(options: UseGoogleLoginOptionsAuthCodeFlow) {
  return () => googleOAuth.requestCode(options)
}
