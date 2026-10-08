import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type OrganizationSessionDetail =
  components['schemas']['OrganizationSessionDetailResponseDto']

export async function getOrganizationSession(
  organizationId: string,
  sessionId: string,
): Promise<OrganizationSessionDetail> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/sessions/{sessionId}',
    { params: { path: { organizationId, sessionId } } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export const getOrganizationSessionQueryOptions = (
  organizationId: string,
  sessionId: string,
) =>
  queryOptions({
    queryKey: ['organizations', organizationId, 'sessions', sessionId],
    queryFn: () => getOrganizationSession(organizationId, sessionId),
  })

export function useOrganizationSession(organizationId: string, sessionId: string) {
  return useQuery(getOrganizationSessionQueryOptions(organizationId, sessionId))
}
