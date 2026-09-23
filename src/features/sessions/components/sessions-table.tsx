import { ChevronRight } from 'lucide-react'

import { StatusPill } from '@/components/ui/status-pill'
import styles from '@/components/ui/table.module.css'
import { cn } from '@/utils/cn'
import { formatCents } from '@/utils/format-currency'
import { formatDateTime } from '@/utils/format-date'
import { formatEnergy } from '@/utils/format-energy'

import type { OrganizationSession } from '../api/get-sessions'
import { sessionStatusLabels, sessionStatusTones } from '../utils/labels'
import { AnomalyBadge } from './anomaly-badge'

type SessionsTableProps = {
  sessions: OrganizationSession[]
  onSelect: (session: OrganizationSession) => void
}

export function SessionsTable({ sessions, onSelect }: SessionsTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={cn(styles.table, styles.wide)} aria-label="Sessões">
        <thead>
          <tr>
            <th scope="col">Início</th>
            <th scope="col">Unidade</th>
            <th scope="col">Morador</th>
            <th scope="col">Ponto</th>
            <th scope="col" className={styles.right}>
              Energia
            </th>
            <th scope="col" className={styles.right}>
              Valor
            </th>
            <th scope="col">Status</th>
            <th scope="col">IA</th>
            <th scope="col">
              <span className="sr-only">Detalhes</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr
              key={session.id}
              className={cn(
                styles.clickable,
                session.isAnomaly && styles.flagged,
              )}
              onClick={() => onSelect(session)}
            >
              <td className={styles.mono}>{formatDateTime(session.startedAt)}</td>
              <td className={cn(styles.mono, styles.strong)}>
                {session.unitLabel ?? '—'}
              </td>
              <td>{session.driver.name}</td>
              <td>
                <span className={styles.strong}>{session.chargePoint.code}</span>
                <span className={styles.subtle}> · {session.chargePoint.name}</span>
              </td>
              <td className={cn(styles.mono, styles.right)}>
                {formatEnergy(session.energyKwh, { maximumFractionDigits: 2 })}
              </td>
              <td className={cn(styles.mono, styles.right, styles.strong)}>
                {formatCents(session.totalCents)}
              </td>
              <td>
                <StatusPill tone={sessionStatusTones[session.status]} withDot>
                  {sessionStatusLabels[session.status]}
                </StatusPill>
              </td>
              <td>
                <AnomalyBadge
                  score={session.anomalyScore}
                  isAnomaly={session.isAnomaly}
                />
              </td>
              <td className={styles.actions}>
                <button
                  type="button"
                  className={styles.rowAction}
                  aria-label={`Ver detalhes da sessão de ${session.driver.name} em ${formatDateTime(session.startedAt)}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelect(session)
                  }}
                >
                  <ChevronRight size={16} strokeWidth={2} aria-hidden />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
