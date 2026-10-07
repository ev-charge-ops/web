import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type Invite = components['schemas']['InviteResponseDto']

export type InviteStatus = components['schemas']['InviteStatus']

export async function getInvites(organizationId: string): Promise<Invite[]> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/invites',
    { params: { path: { organizationId } } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export const getInvitesQueryOptions = (organizationId: string) =>
  queryOptions({
    queryKey: ['organizations', organizationId, 'invites'],
    queryFn: () => getInvites(organizationId),
  })

export function useInvites(organizationId: string) {
  return useQuery(getInvitesQueryOptions(organizationId))
}
