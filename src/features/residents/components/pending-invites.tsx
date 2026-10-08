import { Mail, MailWarning } from 'lucide-react'

import { useNow } from '@/hooks/use-now'
import { cn } from '@/utils/cn'

import type { Invite } from '../api/get-invites'
import { describeInvite, getInviteUrgency } from '../utils/invite-meta'
import type { InviteAction } from './invite-action-dialogs'
import styles from './pending-invites.module.css'

type PendingInvitesProps = {
  invites: Invite[]
  onAction: (action: InviteAction) => void
}

export function PendingInvites({ invites, onAction }: PendingInvitesProps) {
  const now = useNow(60_000)

  if (invites.length === 0) return null

  return (
    <section className={styles.card} aria-labelledby="pending-invites-title">
      <div className={styles.head}>
        <h2 id="pending-invites-title" className={styles.title}>
          Convites pendentes
        </h2>
        <span className={styles.hint}>valem por 7 dias</span>
      </div>
      <ul className={styles.list}>
        {invites.map((invite) => {
          const urgency = getInviteUrgency(invite, now)
          const Icon = urgency === 'normal' ? Mail : MailWarning
          return (
            <li key={invite.id} className={styles.row}>
              <span className={cn(styles.icon, styles[urgency])}>
                <Icon size={18} strokeWidth={2} aria-hidden />
              </span>
              <span className={styles.text}>
                <span className={styles.email}>{invite.email}</span>
                <span className={cn(styles.meta, styles[urgency])}>
                  {describeInvite(invite, now)}
                </span>
              </span>
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
            </li>
          )
        })}
      </ul>
    </section>
  )
}
