import type { StatusTone } from '@/components/ui/status-pill'
import type { components } from '@/lib/api-schema'

import type { SessionStatus } from '../api/get-sessions'

export const sessionStatusLabels = {
  PENDING: 'Aguardando',
  ACTIVE: 'Carregando',
  GRACE: 'Tolerância',
  IDLE: 'Ocupando a vaga',
  CLOSED: 'Encerrada',
  INTERRUPTED: 'Interrompida',
} satisfies Record<SessionStatus, string>

export const sessionStatusTones = {
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

export const demandSourceLabels = {
  MODEL: 'Modelo de IA',
  RULE: 'Regra por horário',
} satisfies Record<components['schemas']['DemandFactorSource'], string>

export const limitTypeLabels = {
  ENERGY: 'Por energia',
  AMOUNT: 'Por valor',
  FULL: 'Até completar',
} satisfies Record<components['schemas']['ChargingLimitType'], string>

const scoreFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatAnomalyScore(score: number) {
  return scoreFormatter.format(score)
}

const factorFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

export function formatDemandFactor(factor: number) {
  return `${factorFormatter.format(factor)}×`
}
