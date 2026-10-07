import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type OrganizationOverview =
  components['schemas']['OrganizationOverviewResponseDto']
export type SiteCapacity = components['schemas']['SiteCapacityDto']

export async function getOverview(
  organizationId: string,
  month?: string,
): Promise<OrganizationOverview> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/overview',
    { params: { path: { organizationId }, query: { month } } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export const getOverviewQueryOptions = (organizationId: string, month?: string) =>
  queryOptions({
    queryKey: ['organizations', organizationId, 'overview', month ?? 'current'],
    queryFn: () => getOverview(organizationId, month),
  })

export function useOverview(organizationId: string, month?: string) {
  return useQuery(getOverviewQueryOptions(organizationId, month))
}
