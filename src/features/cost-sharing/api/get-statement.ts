import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'

export type MonthlyStatement =
  components['schemas']['MonthlyStatementResponseDto']
export type StatementLine = components['schemas']['StatementLineDto']

export async function getStatement(
  organizationId: string,
  month: string,
): Promise<MonthlyStatement> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/statements',
    { params: { path: { organizationId }, query: { month } } },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export const getStatementQueryOptions = (organizationId: string, month: string) =>
  queryOptions({
    queryKey: ['organizations', organizationId, 'statements', month],
    queryFn: () => getStatement(organizationId, month),
  })

export function useStatement(organizationId: string, month: string) {
  return useQuery({
    ...getStatementQueryOptions(organizationId, month),
    placeholderData: keepPreviousData,
  })
}
