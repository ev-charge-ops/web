import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type OrganizationSession = components['schemas']['OrganizationSessionDto']
export type OrganizationSessionPage =
  components['schemas']['OrganizationSessionPageDto']
export type SessionStatus = components['schemas']['ChargingSessionStatus']

export type SessionFilters = {
  month?: string
  status?: SessionStatus
  page?: number
  pageSize?: number
}

export async function getSessions(
  organizationId: string,
  filters: SessionFilters,
): Promise<OrganizationSessionPage> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/sessions',
    { params: { path: { organizationId }, query: filters } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export const getSessionsQueryOptions = (
  organizationId: string,
  filters: SessionFilters,
) =>
  queryOptions({
    queryKey: ['organizations', organizationId, 'sessions', filters],
    queryFn: () => getSessions(organizationId, filters),
  })

export function useSessions(organizationId: string, filters: SessionFilters) {
  return useQuery({
    ...getSessionsQueryOptions(organizationId, filters),
    placeholderData: keepPreviousData,
  })
}
