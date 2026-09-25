import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type SessionDetail = components['schemas']['SessionDetailResponseDto']

export async function getSession(sessionId: string): Promise<SessionDetail> {
  const { data, error, response } = await apiClient.GET(
    '/sessions/{sessionId}',
    { params: { path: { sessionId } } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export const getSessionQueryOptions = (sessionId: string) =>
  queryOptions({
    queryKey: ['sessions', sessionId],
    queryFn: () => getSession(sessionId),
  })

export function useSession(sessionId: string) {
  return useQuery(getSessionQueryOptions(sessionId))
}
