import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { ApiError, publicApiClient } from '@/lib/api-client'
import { useAuth, type AuthSession } from '@/lib/use-auth'

export const emailLoginRequestSchema = z.object({
  email: z.email('Informe um e-mail válido'),
})

export type EmailLoginRequestInput = z.infer<typeof emailLoginRequestSchema>

export const emailLoginCodeLength = 6

export type VerifyEmailLoginInput =
  | { email: string; code: string }
  | { token: string }

export async function requestEmailLogin(input: EmailLoginRequestInput) {
  const { response } = await publicApiClient.POST('/auth/email-login/request', {
    body: input,
  })
  if (!response.ok) throw new ApiError(response.status)
}

export async function verifyEmailLogin(
  input: VerifyEmailLoginInput,
): Promise<AuthSession> {
  const { data, response } = await publicApiClient.POST(
    '/auth/email-login/verify',
    { body: input },
  )
  if (!data) throw new ApiError(response.status)
  return data
}

export function useRequestEmailLogin() {
  return useMutation({ mutationFn: requestEmailLogin })
}

export function useVerifyEmailLogin() {
  const { signIn } = useAuth()
  return useMutation({
    mutationFn: verifyEmailLogin,
    onSuccess: signIn,
  })
}
