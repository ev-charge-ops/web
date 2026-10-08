import { useRef, type KeyboardEvent } from 'react'

import { StatusPill } from '@/components/ui/status-pill'
import tableStyles from '@/components/ui/table.module.css'
import { cn } from '@/utils/cn'
import { formatCents } from '@/utils/format-currency'
import { formatDayMonth, formatDayTime, formatTime } from '@/utils/format-date'
import { formatClockDuration, formatDuration } from '@/utils/format-duration'

import type { OrganizationSession } from '../api/get-sessions'
import { getSessionRowStatus, isFlagged } from '../utils/labels'
import { getChargingMinutes } from '../utils/session-metrics'
import { ScoreMeter } from './score-meter'
import styles from './sessions-table.module.css'

const kwhFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

type SessionsTableProps = {
  sessions: OrganizationSession[]
  selectedId?: string | null
  onSelect: (session: OrganizationSession) => void
}

function Who({ session }: { session: OrganizationSession }) {
  if (session.regime === 'COMMERCIAL') {
    return (
      <>
        <span className={tableStyles.strong}>Visitante</span> · cartão
      </>
    )
  }
  return (
    <>
      <span className={tableStyles.strong}>{session.unitLabel ?? '—'}</span> ·{' '}
      {session.driver.name}
    </>
  )
}

export function SessionsTable({
  sessions,
  selectedId,
  onSelect,
}: SessionsTableProps) {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([])

  const onRowKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const offset =
      event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
    const next = sessions[index + offset]
    if (!offset || !next) return
    event.preventDefault()
    buttonsRef.current[index + offset]?.focus()
    if (selectedId) onSelect(next)
  }

  return (
    <div className={tableStyles.wrap}>
      <table
        className={cn(tableStyles.table, styles.table)}
        aria-label="Sessões"
      >
        <thead>
          <tr>
            <th scope="col">Início</th>
            <th scope="col">Unidade / morador</th>
            <th scope="col">Ponto</th>
            <th scope="col">Energia</th>
            <th scope="col">Tempo</th>
            <th scope="col">Valor</th>
            <th scope="col">Status</th>
            <th scope="col">Score de anomalia</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session, index) => {
            const status = getSessionRowStatus(session)
            const flagged = isFlagged(session)
            return (
              <tr
                key={session.id}
                className={cn(
                  tableStyles.clickable,
                  flagged && tableStyles.flagged,
                  session.id === selectedId && tableStyles.selected,
                )}
                onClick={() => onSelect(session)}
              >
                <td>
                  <button
                    ref={(element) => {
                      buttonsRef.current[index] = element
                    }}
                    type="button"
                    className={styles.open}
                    onKeyDown={(event) => onRowKeyDown(event, index)}
                    aria-label={`Ver detalhes da sessão de ${session.driver.name} em ${formatDayTime(session.startedAt)}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelect(session)
                    }}
                  >
                    <span className={tableStyles.num}>
                      {formatDayMonth(session.startedAt)}
                    </span>{' '}
                    · {formatTime(session.startedAt)}
                  </button>
                </td>
                <td>
                  <Who session={session} />
                </td>
                <td>{session.chargePoint.code}</td>
                <td>
                  <span className={tableStyles.num}>
                    {kwhFormatter.format(session.energyKwh)}
                  </span>{' '}
                  kWh
                </td>
                <td>
                  {formatClockDuration(getChargingMinutes(session))}
                  {session.idleMinutes > 0 ? (
                    <span className={styles.idle}>
                      {' '}
                      + {formatDuration(session.idleMinutes)} ocupação
                    </span>
                  ) : null}
                </td>
                <td>
                  <span className={tableStyles.num}>
                    {formatCents(session.totalCents)}
                  </span>
                </td>
                <td>
                  <StatusPill
                    tone={status.tone}
                    isLive={session.status === 'ACTIVE'}
                    className={flagged ? styles.onFlagged : undefined}
                  >
                    {status.label}
                  </StatusPill>
                </td>
                <td>
                  <ScoreMeter
                    score={session.anomalyScore}
                    isFlagged={flagged}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
