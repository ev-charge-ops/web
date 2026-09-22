import { queryOptions, useQuery } from '@tanstack/react-query'

import { publicApiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type InvitePreview = components['schemas']['InvitePreviewDto']

export async function getInvitePreview(token: string): Promise<InvitePreview> {
  const { data, error, response } = await publicApiClient.GET(
    '/invites/{token}',
    { params: { path: { token } } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export const getInvitePreviewQueryOptions = (token: string) =>
  queryOptions({
    queryKey: ['invites', token, 'preview'],
    queryFn: () => getInvitePreview(token),
  })

export function useInvitePreview(token: string) {
  return useQuery(getInvitePreviewQueryOptions(token))
}
