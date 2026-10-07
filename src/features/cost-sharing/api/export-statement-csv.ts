import { useMutation } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import { downloadBlob } from '@/utils/download-file'

export function getStatementCsvFilename(month: string) {
  return `rateio-${month}.csv`
}

export async function exportStatementCsv(
  organizationId: string,
  month: string,
): Promise<Blob> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/statements/export.csv',
    {
      params: { path: { organizationId }, query: { month } },
      parseAs: 'blob',
    },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export function useExportStatementCsv(organizationId: string) {
  return useMutation({
    mutationFn: async (month: string) => {
      const blob = await exportStatementCsv(organizationId, month)
      downloadBlob(blob, getStatementCsvFilename(month))
      return month
    },
  })
}
