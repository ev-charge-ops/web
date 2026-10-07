import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { apiClient, publicApiClient, toApiError } from '@/lib/api-client'
import { useAuth, type AuthSession } from '@/lib/use-auth'

export const acceptInviteInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe seu nome')
    .max(100, 'Use no máximo 100 caracteres'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .max(128, 'Use no máximo 128 caracteres'),
})

export type AcceptInviteInput = z.infer<typeof acceptInviteInputSchema>

export async function acceptInvite(
  token: string,
  input: AcceptInviteInput,
): Promise<AuthSession> {
  const { data, error, response } = await publicApiClient.POST(
    '/invites/{token}/accept',
    { params: { path: { token } }, body: input },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export async function acceptInviteAsCurrentUser(token: string) {
  const { error, response } = await apiClient.POST(
    '/invites/{token}/accept-authenticated',
    { params: { path: { token } } },
  )
  if (!response.ok) throw toApiError(response, error)
}

type UseAcceptInviteOptions = {
  onSuccess?: () => void
}

export function useAcceptInvite(
  token: string,
  { onSuccess }: UseAcceptInviteOptions = {},
) {
  const { signIn } = useAuth()
  return useMutation({
    mutationFn: (input: AcceptInviteInput) => acceptInvite(token, input),
    onSuccess: (session) => {
      signIn(session)
      onSuccess?.()
    },
  })
}

export function useAcceptInviteAsCurrentUser(
  token: string,
  { onSuccess }: UseAcceptInviteOptions = {},
) {
  return useMutation({
    mutationFn: () => acceptInviteAsCurrentUser(token),
    onSuccess,
  })
}
