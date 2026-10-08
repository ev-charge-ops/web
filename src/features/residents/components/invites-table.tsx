import { StatusPill } from '@/components/ui/status-pill'
import tableStyles from '@/components/ui/table.module.css'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format-date'

import type { Invite } from '../api/get-invites'
import { inviteStatusLabels, inviteStatusTones } from '../utils/labels'
import type { InviteAction } from './invite-action-dialogs'
import styles from './residents-table.module.css'

const actionableStatuses = new Set<Invite['status']>(['PENDING', 'EXPIRED'])

type InvitesTableProps = {
  invites: Invite[]
  emptyMessage: string
  onAction: (action: InviteAction) => void
}

export function InvitesTable({
  invites,
  emptyMessage,
  onAction,
}: InvitesTableProps) {
  return (
    <section className={styles.card} aria-label="Histórico de convites">
      {invites.length === 0 ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : (
        <div className={tableStyles.wrap}>
          <table
            className={cn(tableStyles.table, styles.table)}
            aria-label="Convites"
          >
            <thead>
              <tr>
                <th scope="col">E-mail</th>
                <th scope="col">Unidade</th>
                <th scope="col">Status</th>
                <th scope="col">Enviado em</th>
                <th scope="col">Expira em</th>
                <th scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td className={tableStyles.strong}>{invite.email}</td>
                  <td>{invite.unitLabel ?? '—'}</td>
                  <td>
                    <StatusPill tone={inviteStatusTones[invite.status]}>
                      {inviteStatusLabels[invite.status]}
                    </StatusPill>
                  </td>
                  <td>
                    <span className={tableStyles.num}>
                      {formatDate(invite.createdAt)}
                    </span>
                  </td>
                  <td>
                    {invite.status === 'ACCEPTED' || invite.status === 'REVOKED'
                      ? '—'
                      : formatDate(invite.expiresAt)}
                  </td>
                  <td>
                    {actionableStatuses.has(invite.status) ? (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.resend}
                          aria-label={`Reenviar convite para ${invite.email}`}
                          onClick={() => onAction({ type: 'resend', invite })}
                        >
                          Reenviar
                        </button>
                        <button
                          type="button"
                          className={styles.revoke}
                          aria-label={`Revogar convite para ${invite.email}`}
                          onClick={() => onAction({ type: 'revoke', invite })}
                        >
                          Revogar
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
