import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/utils/cn'
import { formatMonth } from '@/utils/month'

import { useExportStatementCsv } from '../api/export-statement-csv'
import styles from './export-csv-button.module.css'

const doneResetMs = 1500

type ExportState =
  | { phase: 'idle' }
  | { phase: 'exporting'; progress: number | null }
  | { phase: 'done'; month: string }

type ExportCsvButtonProps = {
  organizationId: string
  month: string
  disabled?: boolean
}

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

export function ExportCsvButton({
  organizationId,
  month,
  disabled,
}: ExportCsvButtonProps) {
  const exportCsv = useExportStatementCsv(organizationId)
  const { showToast } = useToast()
  const [state, setState] = useState<ExportState>({ phase: 'idle' })

  useEffect(() => {
    if (state.phase !== 'done') return
    const timeout = setTimeout(() => setState({ phase: 'idle' }), doneResetMs)
    return () => clearTimeout(timeout)
  }, [state.phase])

  const start = () => {
    setState({ phase: 'exporting', progress: null })
    exportCsv.mutate(
      {
        month,
        onProgress: (progress) => setState({ phase: 'exporting', progress }),
      },
      {
        onSuccess: (exported) => setState({ phase: 'done', month: exported }),
        onError: () => {
          setState({ phase: 'idle' })
          showToast({
            tone: 'error',
            message: 'Não foi possível exportar o CSV. Tente novamente.',
          })
        },
      },
    )
  }

  const progress = state.phase === 'exporting' ? state.progress : null

  return (
    <>
      <button
        type="button"
        className={cn(styles.button, styles[state.phase])}
        disabled={disabled || state.phase !== 'idle'}
        aria-busy={state.phase === 'exporting' || undefined}
        onClick={start}
      >
        {state.phase === 'exporting' ? (
          <span
            className={styles.progress}
            style={{ width: `${(progress ?? 0.15) * 100}%` }}
            aria-hidden="true"
          />
        ) : null}
        <span key={state.phase} className={styles.content}>
          {state.phase === 'done' ? (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={styles.check}
              >
                <path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Baixado
            </>
          ) : state.phase === 'exporting' ? (
            progress === null ? (
              'Gerando CSV…'
            ) : (
              <>
                Gerando CSV ·{' '}
                <span className="tnum">
                  {percentFormatter.format(progress)}
                </span>
              </>
            )
          ) : (
            <>
              <Download size={18} strokeWidth={2} aria-hidden />
              Exportar CSV
            </>
          )}
        </span>
      </button>
      <span className="sr-only" role="status">
        {state.phase === 'done'
          ? `CSV do rateio de ${formatMonth(state.month)} baixado.`
          : ''}
      </span>
    </>
  )
}
