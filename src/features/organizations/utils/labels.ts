import type { components } from '@/lib/api-schema'

export const organizationTypeLabels = {
  PRIVATE: 'Condomínio residencial',
  COMMERCIAL: 'Estacionamento comercial',
} satisfies Record<components['schemas']['OrganizationType'], string>
