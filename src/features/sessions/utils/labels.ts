import type { StatusTone } from '@/components/ui/status-pill'
import type { components } from '@/lib/api-schema'

import type { SessionStatus } from '../api/get-sessions'

export const sessionStatusLabels = {
  AWAITING_PAYMENT: 'Aguardando pagamento',
  PENDING: 'Aguardando',
  ACTIVE: 'Carregando',
  GRACE: 'Tolerância',
  IDLE: 'Ocupando a vaga',
  CLOSED: 'Concluída',
  INTERRUPTED: 'Interrompida',
} satisfies Record<SessionStatus, string>

export const sessionStatusTones = {
  AWAITING_PAYMENT: 'info',
  PENDING: 'info',
  ACTIVE: 'charging',
  GRACE: 'idle',
  IDLE: 'fault',
  CLOSED: 'charging',
  INTERRUPTED: 'offline',
} satisfies Record<SessionStatus, StatusTone>

export const sessionStatuses = Object.keys(
  sessionStatusLabels,
) as SessionStatus[]

export const regimeLabels = {
  PRIVATE: 'Rateio',
  COMMERCIAL: 'Visitante',
} satisfies Record<components['schemas']['ChargePointType'], string>

export const limitTypeLabels = {
  ENERGY: 'Por energia',
  AMOUNT: 'Por valor',
  FULL: 'Até completar',
  PERCENT: 'Por carga da bateria',
} satisfies Record<components['schemas']['ChargingLimitType'], string>

export const anomalyReviewLabels = {
  PENDING_REVIEW: 'Para revisar',
  CONFIRMED: 'Anomalia confirmada',
  DISMISSED: 'Descartada',
} satisfies Record<components['schemas']['AnomalyReviewStatus'], string>

export const anomalyReviewTones = {
  PENDING_REVIEW: 'fault',
  CONFIRMED: 'idle',
  DISMISSED: 'offline',
} satisfies Record<components['schemas']['AnomalyReviewStatus'], StatusTone>

const scoreFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatAnomalyScore(score: number) {
  return scoreFormatter.format(score)
}

export function formatAnomalySource(modelVersion: string | null) {
  return modelVersion ? `IA · ${modelVersion}` : 'Regra'
}

type RowStatusSession = {
  status: SessionStatus
  idleFeeCents: number
  isAnomaly: boolean | null
  anomalyReviewStatus: components['schemas']['AnomalyReviewStatus'] | null
}

export function getSessionRowStatus(session: RowStatusSession): {
  label: string
  tone: StatusTone
} {
  if (session.isAnomaly && session.anomalyReviewStatus === 'PENDING_REVIEW') {
    return { label: 'Revisar', tone: 'fault' }
  }
  if (session.status === 'CLOSED' && session.idleFeeCents > 0) {
    return { label: 'Multa aplicada', tone: 'idle' }
  }
  return {
    label: sessionStatusLabels[session.status],
    tone: sessionStatusTones[session.status],
  }
}

export function isFlagged(
  session: Pick<RowStatusSession, 'isAnomaly' | 'anomalyReviewStatus'>,
) {
  return (
    Boolean(session.isAnomaly) && session.anomalyReviewStatus !== 'DISMISSED'
  )
}
