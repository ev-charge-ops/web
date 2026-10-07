import { ApiError } from '@/lib/api-client'

import type { InvitePreview } from '../api/get-invite-preview'

export type UnavailableReason = Exclude<InvitePreview['status'], 'PENDING'>

const unavailableCodes: Record<string, UnavailableReason> = {
  INVITE_EXPIRED: 'EXPIRED',
  INVITE_REVOKED: 'REVOKED',
  INVITE_ALREADY_ACCEPTED: 'ACCEPTED',
}

export const unavailableMessages = {
  EXPIRED: {
    title: 'Convite expirado',
    description:
      'Este convite passou da validade. Peça ao gestor do condomínio para reenviá-lo.',
  },
  REVOKED: {
    title: 'Convite revogado',
    description:
      'Este convite foi cancelado pelo gestor do condomínio. Fale com ele se precisar de um novo.',
  },
  ACCEPTED: {
    title: 'Convite já utilizado',
    description:
      'Este convite já foi aceito. Entre no app EV ChargeOps com a sua conta.',
  },
} satisfies Record<UnavailableReason, { title: string; description: string }>

export function getUnavailableReason(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 410) return null
  return (error.code && unavailableCodes[error.code]) || 'EXPIRED'
}

export function isTooManyRequests(error: unknown) {
  return error instanceof ApiError && error.status === 429
}

export function hasErrorCode(error: unknown, code: string) {
  return error instanceof ApiError && error.code === code
}
