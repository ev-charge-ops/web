import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'

import { getInvitesQueryOptions } from './get-invites'

export async function revokeInvite(organizationId: string, inviteId: string) {
  const { error, response } = await apiClient.DELETE(
    '/organizations/{organizationId}/invites/{inviteId}',
    { params: { path: { organizationId, inviteId } } },
  )
  if (!response.ok) throw toApiError(response, error)
}

export function useRevokeInvite(organizationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(organizationId, inviteId),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: getInvitesQueryOptions(organizationId).queryKey,
      }),
  })
}
