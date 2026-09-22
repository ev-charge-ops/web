import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type MyOrganization = components['schemas']['MyOrganizationDto']

export async function getMyOrganizations(): Promise<MyOrganization[]> {
  const { data, error, response } = await apiClient.GET('/me/organizations')
  if (!data) throw toApiError(response, error)
  return data
}

export const getMyOrganizationsQueryOptions = () =>
  queryOptions({
    queryKey: ['organizations', 'mine'],
    queryFn: getMyOrganizations,
  })

export function useMyOrganizations() {
  return useQuery(getMyOrganizationsQueryOptions())
}
