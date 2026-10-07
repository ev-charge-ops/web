import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { apiClient, toApiError } from '@/lib/api-client'

import { getInvitesQueryOptions, type Invite } from './get-invites'

export const createInviteInputSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  unitLabel: z
    .string()
    .trim()
    .min(1, 'Informe a unidade')
    .max(50, 'Use no máximo 50 caracteres'),
})

export type CreateInviteInput = z.infer<typeof createInviteInputSchema>

export async function createInvite(
  organizationId: string,
  input: CreateInviteInput,
): Promise<Invite> {
  const { data, error, response } = await apiClient.POST(
    '/organizations/{organizationId}/invites',
    { params: { path: { organizationId } }, body: input },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export function useCreateInvite(organizationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateInviteInput) => createInvite(organizationId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: getInvitesQueryOptions(organizationId).queryKey,
      }),
  })
}
