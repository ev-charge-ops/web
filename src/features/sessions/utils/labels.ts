import type { StatusTone } from '@/components/ui/status-pill'
import type { components } from '@/lib/api-schema'

import type { SessionStatus } from '../api/get-sessions'

export const sessionStatusLabels = {
  AWAITING_PAYMENT: 'Aguardando pagamento',
  PENDING: 'Aguardando',
  ACTIVE: 'Carregando',
  GRACE: 'Tolerância',
  IDLE: 'Ocupando a vaga',
  CLOSED: 'Encerrada',
  INTERRUPTED: 'Interrompida',
} satisfies Record<SessionStatus, string>

export const sessionStatusTones = {
  AWAITING_PAYMENT: 'info',
  PENDING: 'info',
  ACTIVE: 'charging',
  GRACE: 'idle',
  IDLE: 'fault',
  CLOSED: 'offline',
  INTERRUPTED: 'fault',
} satisfies Record<SessionStatus, StatusTone>

export const sessionStatuses = Object.keys(sessionStatusLabels) as SessionStatus[]

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
