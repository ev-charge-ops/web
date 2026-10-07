import {
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback } from 'react'

import { ApiError, apiClient } from '@/lib/api-client'
import type { AuthUser } from '@/lib/use-auth'

export async function getMe(): Promise<AuthUser> {
  const { data, response } = await apiClient.GET('/auth/me')
  if (!data) throw new ApiError(response.status)
  return data
}

export const getMeQueryOptions = () =>
  queryOptions({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
  })

export function useMe() {
  return useQuery(getMeQueryOptions())
}

export function useRefreshMe() {
  const queryClient = useQueryClient()
  return useCallback(
    () => queryClient.fetchQuery({ ...getMeQueryOptions(), staleTime: 0 }),
    [queryClient],
  )
}
