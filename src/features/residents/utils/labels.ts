import type { StatusTone } from '@/components/ui/status-pill'
import type { components } from '@/lib/api-schema'

import type { InviteStatus } from '../api/get-invites'

export const inviteStatusLabels = {
  PENDING: 'Pendente',
  EXPIRED: 'Expirado',
  ACCEPTED: 'Aceito',
  REVOKED: 'Revogado',
} satisfies Record<InviteStatus, string>

export const inviteStatusTones = {
  PENDING: 'idle',
  EXPIRED: 'fault',
  ACCEPTED: 'charging',
  REVOKED: 'offline',
} satisfies Record<InviteStatus, StatusTone>

export const membershipRoleLabels = {
  MANAGER: 'Gestor',
  DRIVER: 'Morador',
} satisfies Record<components['schemas']['MembershipRole'], string>
