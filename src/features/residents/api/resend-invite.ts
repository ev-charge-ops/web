import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'

import { getInvitesQueryOptions, type Invite } from './get-invites'

export async function resendInvite(
  organizationId: string,
  inviteId: string,
): Promise<Invite> {
  const { data, error, response } = await apiClient.POST(
    '/organizations/{organizationId}/invites/{inviteId}/resend',
    { params: { path: { organizationId, inviteId } } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export function useResendInvite(organizationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) => resendInvite(organizationId, inviteId),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: getInvitesQueryOptions(organizationId).queryKey,
      }),
  })
}
