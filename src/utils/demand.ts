import type { components } from '@/lib/api-schema'

type DemandFactorSource = components['schemas']['DemandFactorSource']

export const demandSourceLabels = {
  MODEL: 'Modelo de IA',
  RULE: 'Regra por horário',
} satisfies Record<DemandFactorSource, string>

const factorFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

export function formatDemandFactor(factor: number) {
  return `${factorFormatter.format(factor)}×`
}

export function formatDemandSource(
  source: DemandFactorSource,
  modelVersion: string | null,
) {
  return [demandSourceLabels[source], modelVersion].filter(Boolean).join(' · ')
}
