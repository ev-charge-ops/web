import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

type Overview = components['schemas']['OrganizationOverviewResponseDto']

export type VisitorSessions = {
  sessionsCount: number
  commercialPointCodes: string[]
}

async function getMonthOverview(
  organizationId: string,
  month: string,
): Promise<Overview> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/overview',
    { params: { path: { organizationId }, query: { month } } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export function toVisitorSessions(overview: Overview): VisitorSessions {
  return {
    sessionsCount: overview.visitorSessionsCount,
    commercialPointCodes: overview.chargePoints
      .filter((point) => point.type === 'COMMERCIAL')
      .map((point) => point.code),
  }
}

export const getVisitorSessionsQueryOptions = (
  organizationId: string,
  month: string,
) =>
  queryOptions({
    queryKey: ['organizations', organizationId, 'overview', month],
    queryFn: () => getMonthOverview(organizationId, month),
    select: toVisitorSessions,
  })

export function useVisitorSessions(organizationId: string, month: string) {
  return useQuery(getVisitorSessionsQueryOptions(organizationId, month))
}
