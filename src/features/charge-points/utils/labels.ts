import type { StatusTone } from '@/components/ui/status-pill'
import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export const chargePointStatusLabels = {
  AVAILABLE: 'Disponível',
  CHARGING: 'Carregando',
  IDLE: 'Ocupado',
  OFFLINE: 'Offline',
} satisfies Record<Schemas['ChargePointStatus'], string>

export const chargePointStatusTones = {
  AVAILABLE: 'charging',
  CHARGING: 'charging',
  IDLE: 'idle',
  OFFLINE: 'offline',
} satisfies Record<Schemas['ChargePointStatus'], StatusTone>

export const chargePointTypeLabels = {
  PRIVATE: 'Moradores · rateio',
  COMMERCIAL: 'Visitantes · cartão',
} satisfies Record<Schemas['ChargePointType'], string>

export const connectorLabels = {
  TYPE_2: 'Tipo 2 (AC)',
  CCS_2: 'CCS 2 (DC)',
} satisfies Record<Schemas['ConnectorType'], string>

export const demandLevelLabels = {
  OFF_PEAK: 'Fora de pico',
  NORMAL: 'Normal',
  PEAK: 'Pico',
} satisfies Record<Schemas['DemandLevel'], string>

export const demandLevelTones = {
  OFF_PEAK: 'charging',
  NORMAL: 'info',
  PEAK: 'fault',
} satisfies Record<Schemas['DemandLevel'], StatusTone>
