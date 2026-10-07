import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type ChargePoint = components['schemas']['ChargePointResponseDto']

export async function getChargePoints(
  organizationId: string,
): Promise<ChargePoint[]> {
  const { data, error, response } = await apiClient.GET('/charge-points', {
    params: { query: { organizationId } },
  })
  if (!data) throw toApiError(response, error)
  return data
}

export const getChargePointsQueryOptions = (organizationId: string) =>
  queryOptions({
    queryKey: ['charge-points', organizationId],
    queryFn: () => getChargePoints(organizationId),
  })

export function useChargePoints(organizationId: string) {
  return useQuery(getChargePointsQueryOptions(organizationId))
}
