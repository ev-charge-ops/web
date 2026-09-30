import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

import {
  getOrganizationSessionQueryOptions,
  type OrganizationSessionDetail,
} from './get-organization-session'

export type AnomalyReviewDecision = components['schemas']['AnomalyReviewDecision']
export type AnomalyReviewStatus = components['schemas']['AnomalyReviewStatus']

export const anomalyReviewNoteMaxLength = 500

export type ReviewSessionAnomalyInput = {
  sessionId: string
  status: AnomalyReviewDecision
  note?: string
}

export async function reviewSessionAnomaly(
  organizationId: string,
  { sessionId, status, note }: ReviewSessionAnomalyInput,
): Promise<OrganizationSessionDetail> {
  const trimmedNote = note?.trim()
  const { data, error, response } = await apiClient.POST(
    '/organizations/{organizationId}/sessions/{sessionId}/anomaly-review',
    {
      params: { path: { organizationId, sessionId } },
      body: trimmedNote ? { status, note: trimmedNote } : { status },
    },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export function useReviewSessionAnomaly(organizationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ReviewSessionAnomalyInput) =>
      reviewSessionAnomaly(organizationId, input),
    onSuccess: (session) => {
      queryClient.setQueryData(
        getOrganizationSessionQueryOptions(organizationId, session.id).queryKey,
        session,
      )
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['organizations', organizationId, 'sessions'],
          refetchType: 'active',
          predicate: (query) => query.queryKey[3] !== session.id,
        }),
        queryClient.invalidateQueries({
          queryKey: ['organizations', organizationId, 'overview'],
        }),
      ])
    },
  })
}
