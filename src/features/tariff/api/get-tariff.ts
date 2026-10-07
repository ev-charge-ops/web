import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type Tariff = components['schemas']['TariffResponseDto']

export async function getTariff(organizationId: string): Promise<Tariff> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/tariff',
    { params: { path: { organizationId } } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export const getTariffQueryOptions = (organizationId: string) =>
  queryOptions({
    queryKey: ['organizations', organizationId, 'tariff'],
    queryFn: () => getTariff(organizationId),
  })

export function useTariff(organizationId: string) {
  return useQuery(getTariffQueryOptions(organizationId))
}
