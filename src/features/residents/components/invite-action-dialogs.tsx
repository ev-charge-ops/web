import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/use-toast'

import type { Invite } from '../api/get-invites'
import { useResendInvite } from '../api/resend-invite'
import { useRevokeInvite } from '../api/revoke-invite'
import { getInviteActionErrorMessage } from '../utils/error-messages'

export type InviteAction = { type: 'resend' | 'revoke'; invite: Invite }

type InviteActionDialogsProps = {
  organizationId: string
  action: InviteAction | null
  onClose: () => void
}

export function InviteActionDialogs({
  organizationId,
  action,
  onClose,
}: InviteActionDialogsProps) {
  const resendInvite = useResendInvite(organizationId)
  const revokeInvite = useRevokeInvite(organizationId)
  const { showToast } = useToast()

  const confirm = () => {
    if (!action) return
    const { type, invite } = action
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
        showToast({
          tone: 'error',
          message: getInviteActionErrorMessage(error),
        })
      },
      onSettled: onClose,
    })
  }

  return (
    <>
      <ConfirmDialog
        isOpen={action?.type === 'resend'}
        title="Reenviar convite?"
        description={`Um novo link será enviado para ${action?.invite.email ?? ''} e valerá por mais 7 dias. O link anterior deixa de funcionar.`}
        confirmLabel="Reenviar"
        isConfirming={resendInvite.isPending}
        onConfirm={confirm}
        onCancel={onClose}
      />
      <ConfirmDialog
        isOpen={action?.type === 'revoke'}
        title="Revogar convite?"
        description={`O link enviado para ${action?.invite.email ?? ''} deixa de funcionar. Você pode convidar o mesmo e-mail novamente depois.`}
        confirmLabel="Revogar"
        isDestructive
        isConfirming={revokeInvite.isPending}
        onConfirm={confirm}
        onCancel={onClose}
      />
    </>
  )
}
