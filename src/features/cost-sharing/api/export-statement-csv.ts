import { useMutation } from '@tanstack/react-query'

import { apiClient, toApiError } from '@/lib/api-client'
import { getContentDispositionFilename } from '@/utils/content-disposition'
import { downloadBlob } from '@/utils/download-file'

export function getStatementCsvFilename(month: string) {
  return `rateio-${month}.csv`
}

export type StatementCsv = {
  blob: Blob
  filename: string
}

export async function exportStatementCsv(
  organizationId: string,
  month: string,
): Promise<StatementCsv> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/statements/export.csv',
    {
      params: { path: { organizationId }, query: { month } },
      parseAs: 'blob',
    },
  )
  if (!data) throw toApiError(response, error)
  return {
    blob: data,
    filename:
      getContentDispositionFilename(response.headers.get('Content-Disposition')) ??
      getStatementCsvFilename(month),
  }
}

export function useExportStatementCsv(organizationId: string) {
  return useMutation({
    mutationFn: async (month: string) => {
      const { blob, filename } = await exportStatementCsv(organizationId, month)
      downloadBlob(blob, filename)
      return month
    },
  })
}
