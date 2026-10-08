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

type ExportProgress = (fraction: number) => void

async function readWithProgress(
  stream: ReadableStream<Uint8Array>,
  total: number | null,
  onProgress?: ExportProgress,
) {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.byteLength
    if (total) onProgress?.(Math.min(1, loaded / total))
  }
  return chunks
}

export async function exportStatementCsv(
  organizationId: string,
  month: string,
  onProgress?: ExportProgress,
): Promise<StatementCsv> {
  const { data, error, response } = await apiClient.GET(
    '/organizations/{organizationId}/statements/export.csv',
    {
      params: { path: { organizationId }, query: { month } },
      parseAs: 'stream',
    },
  )
  if (!data) throw toApiError(response, error)
  const total = Number(response.headers.get('Content-Length')) || null
  const chunks = await readWithProgress(data, total, onProgress)
  onProgress?.(1)
  return {
    blob: new Blob(chunks as BlobPart[], {
      type: response.headers.get('Content-Type') ?? 'text/csv',
    }),
    filename:
      getContentDispositionFilename(
        response.headers.get('Content-Disposition'),
      ) ?? getStatementCsvFilename(month),
  }
}

type ExportInput = {
  month: string
  onProgress?: ExportProgress
}

export function useExportStatementCsv(organizationId: string) {
  return useMutation({
    mutationFn: async ({ month, onProgress }: ExportInput) => {
      const { blob, filename } = await exportStatementCsv(
        organizationId,
        month,
        onProgress,
      )
      downloadBlob(blob, filename)
      return month
    },
  })
}
