import { formatDayMonth } from '@/utils/format-date'

import type { Invite } from '../api/get-invites'
import { membershipRoleLabels } from './labels'

const dayMs = 24 * 60 * 60 * 1000

export function getInviteUrgency(invite: Invite, now: number) {
  if (invite.status === 'EXPIRED') return 'expired'
  const left = new Date(invite.expiresAt).getTime() - now
  return left <= dayMs ? 'soon' : 'normal'
}

export function describeInvite(invite: Invite, now: number) {
  const urgency = getInviteUrgency(invite, now)
  const expiry =
    urgency === 'expired'
      ? `expirou em ${formatDayMonth(invite.expiresAt)}`
      : urgency === 'soon'
        ? `expira em breve, ${formatDayMonth(invite.expiresAt)}`
        : `expira em ${formatDayMonth(invite.expiresAt)}`
  return [
    invite.unitLabel,
    membershipRoleLabels[invite.role],
    urgency === 'normal'
      ? `enviado em ${formatDayMonth(invite.createdAt)}`
      : null,
    expiry,
  ]
    .filter(Boolean)
    .join(' · ')
}
