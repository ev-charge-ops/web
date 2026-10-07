import { RotateCw, X } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Spinner } from '@/components/ui/spinner'
import { StatusPill } from '@/components/ui/status-pill'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/utils/format-date'

import { useInvites, type Invite } from '../api/get-invites'
import { useResendInvite } from '../api/resend-invite'
import { useRevokeInvite } from '../api/revoke-invite'
import { getInviteActionErrorMessage } from '../utils/error-messages'
import { inviteStatusLabels, inviteStatusTones } from '../utils/labels'
import styles from '@/components/ui/table.module.css'

type PendingAction = { type: 'resend' | 'revoke'; invite: Invite }

const actionableStatuses = new Set<Invite['status']>(['PENDING', 'EXPIRED'])

type InvitesTableProps = {
  organizationId: string
}

export function InvitesTable({ organizationId }: InvitesTableProps) {
  const invites = useInvites(organizationId)
  const resendInvite = useResendInvite(organizationId)
  const revokeInvite = useRevokeInvite(organizationId)
  const { showToast } = useToast()
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  const closeDialog = () => setPendingAction(null)

  const confirmAction = () => {
    if (!pendingAction) return
    const { type, invite } = pendingAction
    const mutation = type === 'resend' ? resendInvite : revokeInvite
    mutation.mutate(invite.id, {
      onSuccess: () => {
        showToast({
          tone: 'success',
          message:
            type === 'resend'
              ? `Convite reenviado para ${invite.email}`
              : `Convite para ${invite.email} revogado`,
        })
      },
      onError: (error) => {
        showToast({ tone: 'error', message: getInviteActionErrorMessage(error) })
      },
      onSettled: closeDialog,
    })
  }

  return (
    <Card flush>
      <div className={styles.head}>
        <h2 className={styles.title}>Convites</h2>
        {invites.data ? (
          <span className={styles.count}>{invites.data.length}</span>
        ) : null}
      </div>
      {invites.isPending ? (
        <div className={styles.state}>
          <Spinner label="Carregando convites" />
        </div>
      ) : invites.error ? (
        <div className={styles.state}>
          <Alert>Não foi possível carregar os convites.</Alert>
        </div>
      ) : invites.data.length === 0 ? (
        <p className={styles.empty}>Nenhum convite enviado ainda.</p>
      ) : (
        <div className={styles.wrap}>
          <table className={styles.table} aria-label="Convites">
            <thead>
              <tr>
                <th scope="col">E-mail</th>
                <th scope="col">Unidade</th>
                <th scope="col">Status</th>
                <th scope="col">Enviado em</th>
                <th scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {invites.data.map((invite) => (
                <tr key={invite.id}>
                  <td className={styles.strong}>{invite.email}</td>
                  <td className={styles.mono}>{invite.unitLabel ?? '—'}</td>
                  <td>
                    <StatusPill tone={inviteStatusTones[invite.status]} withDot>
                      {inviteStatusLabels[invite.status]}
                    </StatusPill>
                  </td>
                  <td className={styles.mono}>{formatDate(invite.createdAt)}</td>
                  <td>
                    {actionableStatuses.has(invite.status) ? (
                      <div className={styles.actions}>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<RotateCw size={14} strokeWidth={2} aria-hidden />}
                          aria-label={`Reenviar convite para ${invite.email}`}
                          onClick={() =>
                            setPendingAction({ type: 'resend', invite })
                          }
                        >
                          Reenviar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<X size={14} strokeWidth={2} aria-hidden />}
                          aria-label={`Revogar convite para ${invite.email}`}
                          onClick={() =>
                            setPendingAction({ type: 'revoke', invite })
                          }
                        >
                          Revogar
                        </Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={pendingAction?.type === 'resend'}
        title="Reenviar convite?"
        description={`Um novo link será enviado para ${pendingAction?.invite.email ?? ''} e valerá por mais 7 dias. O link anterior deixa de funcionar.`}
        confirmLabel="Reenviar"
        isConfirming={resendInvite.isPending}
        onConfirm={confirmAction}
        onCancel={closeDialog}
      />
      <ConfirmDialog
        isOpen={pendingAction?.type === 'revoke'}
        title="Revogar convite?"
        description={`O link enviado para ${pendingAction?.invite.email ?? ''} deixa de funcionar. Você pode convidar o mesmo e-mail novamente depois.`}
        confirmLabel="Revogar"
        isConfirming={revokeInvite.isPending}
        onConfirm={confirmAction}
        onCancel={closeDialog}
      />
    </Card>
  )
}
