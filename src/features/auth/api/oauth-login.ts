import { useMutation } from '@tanstack/react-query'

import { ApiError, publicApiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'
import { useAuth, type AuthSession } from '@/lib/use-auth'

export type GoogleCodeLoginInput = components['schemas']['GoogleCodeLoginDto']

export type AppleLoginInput = components['schemas']['AppleLoginDto']

export const googleCodeFlowNotConfiguredCode = 'GOOGLE_CODE_FLOW_NOT_CONFIGURED'

export async function loginWithGoogleCode(
  input: GoogleCodeLoginInput,
): Promise<AuthSession> {
  const { data, error, response } = await publicApiClient.POST(
    '/auth/oauth/google/code',
    { body: input },
  )
  if (!data) throw toApiError(response, error)
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

export function useGoogleCodeLogin() {
  const { signIn } = useAuth()
  return useMutation({ mutationFn: loginWithGoogleCode, onSuccess: signIn })
}

export function useAppleLogin() {
  const { signIn } = useAuth()
  return useMutation({ mutationFn: loginWithApple, onSuccess: signIn })
}
