import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'

export type VisitorSessions = {
  sessionsCount: number
  commercialPointCodes: string[]
}

async function getCommercialPoints(organizationId: string) {
  const { data, error, response } = await apiClient.GET('/charge-points', {
    params: { query: { organizationId } },
  })
  if (!data) throw toApiError(response, error)
  return data.filter((point) => point.type === 'COMMERCIAL')
}

async function countPointSessions(
  organizationId: string,
  chargePointId: string,
  month: string,
) {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/sessions',
    {
      params: {
        path: { organizationId },
        query: { month, chargePointId, page: 1, pageSize: 1 },
      },
    },
  )
  if (!data) throw toApiError(response, error)
  return data.total
}

export async function getVisitorSessions(
  organizationId: string,
  month: string,
): Promise<VisitorSessions> {
  const points = await getCommercialPoints(organizationId)
  const counts = await Promise.all(
    points.map((point) => countPointSessions(organizationId, point.id, month)),
  )
  return {
    sessionsCount: counts.reduce((sum, count) => sum + count, 0),
    commercialPointCodes: points.map((point) => point.code),
  }
}

export const getVisitorSessionsQueryOptions = (
  organizationId: string,
  month: string,
) =>
  queryOptions({
    queryKey: ['organizations', organizationId, 'visitor-sessions', month],
    queryFn: () => getVisitorSessions(organizationId, month),
  })

export function useVisitorSessions(organizationId: string, month: string) {
  return useQuery(getVisitorSessionsQueryOptions(organizationId, month))
}
