import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type ChargePoint = components['schemas']['ChargePointResponseDto']

export async function getChargePoints(): Promise<ChargePoint[]> {
  const { data, error, response } = await apiClient.GET('/charge-points')
  if (!data) throw toApiError(response, error)
  return data
}

export const getChargePointsQueryOptions = () =>
  queryOptions({
    queryKey: ['charge-points'],
    queryFn: getChargePoints,
  })

export function useChargePoints(organizationId: string) {
  return useQuery({
    ...getChargePointsQueryOptions(),
    select: (chargePoints) =>
      chargePoints.filter((point) => point.organizationId === organizationId),
  })
}
