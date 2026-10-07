import { useMutation } from '@tanstack/react-query'

import { ApiError, publicApiClient } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'
import { useAuth, type AuthSession } from '@/lib/use-auth'

export type GoogleLoginInput = components['schemas']['GoogleLoginDto']

export type AppleLoginInput = components['schemas']['AppleLoginDto']

export async function loginWithGoogle(
  input: GoogleLoginInput,
): Promise<AuthSession> {
  const { data, response } = await publicApiClient.POST('/auth/oauth/google', {
    body: input,
  })
  if (!data) throw new ApiError(response.status)
  return data
}

export async function loginWithApple(
  input: AppleLoginInput,
): Promise<AuthSession> {
  const { data, response } = await publicApiClient.POST('/auth/oauth/apple', {
    body: input,
  })
  if (!data) throw new ApiError(response.status)
  return data
}

export function useGoogleLogin() {
  const { signIn } = useAuth()
  return useMutation({ mutationFn: loginWithGoogle, onSuccess: signIn })
}

export function useAppleLogin() {
  const { signIn } = useAuth()
  return useMutation({ mutationFn: loginWithApple, onSuccess: signIn })
}
