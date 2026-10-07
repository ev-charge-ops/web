import type { components } from '@/lib/api-schema'

type MyOrganization = components['schemas']['MyOrganizationDto']

export const managedOrganization: MyOrganization = {
  id: '9c8b7a65-4321-4fed-8cba-0987654321aa',
  name: 'Residencial Aclimação',
  type: 'PRIVATE',
  role: 'MANAGER',
  unitLabel: null,
}

export const secondManagedOrganization: MyOrganization = {
  id: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'Condomínio Jardim Paulista',
  type: 'PRIVATE',
  role: 'MANAGER',
  unitLabel: null,
}

export const drivenOrganization: MyOrganization = {
  id: '5f4e3d2c-1b0a-4987-a654-3210fedcba98',
  name: 'Edifício Vila Mariana',
  type: 'PRIVATE',
  role: 'DRIVER',
  unitLabel: 'B · 42',
}
