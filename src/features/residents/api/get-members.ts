import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type OrganizationMember = components['schemas']['OrganizationMemberDto']

export async function getMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/members',
    { params: { path: { organizationId } } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export const getMembersQueryOptions = (organizationId: string) =>
  queryOptions({
    queryKey: ['organizations', organizationId, 'members'],
    queryFn: () => getMembers(organizationId),
  })

export function useMembers(organizationId: string) {
  return useQuery(getMembersQueryOptions(organizationId))
}
