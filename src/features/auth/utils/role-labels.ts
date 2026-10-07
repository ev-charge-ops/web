import type { components } from '@/lib/api-schema'

export const roleLabels = {
  MANAGER: 'Gestor do condomínio',
  DRIVER: 'Motorista',
} satisfies Record<components['schemas']['Role'], string>
