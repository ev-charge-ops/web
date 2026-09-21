import type { components } from '@/lib/api-schema'

type Invite = components['schemas']['InviteResponseDto']
type InvitePreview = components['schemas']['InvitePreviewDto']
type OrganizationMember = components['schemas']['OrganizationMemberDto']

export const members: OrganizationMember[] = [
  {
    userId: '6f1c2a52-6d1e-4c43-9a43-1e7f0f6f2b01',
    name: 'Marina Costa',
    email: 'marina@example.com',
    role: 'MANAGER',
    unitLabel: null,
    joinedAt: '2026-09-01T12:00:00.000Z',
  },
  {
    userId: '0b3a7e9c-2f6e-4b8a-8c1d-5a9e4f7d3c02',
    name: 'Diego Lima',
    email: 'diego@example.com',
    role: 'DRIVER',
    unitLabel: 'A · 12',
    joinedAt: '2026-09-20T12:00:00.000Z',
  },
]

export function createInviteResponse(overrides: Partial<Invite> = {}): Invite {
  return {
    id: 'b6c0f5d2-2f1e-4d7e-9a3c-7e8f9a0b1c2d',
    email: 'ana@example.com',
    unitLabel: 'B · 42',
    role: 'DRIVER',
    status: 'PENDING',
    expiresAt: '2026-10-14T12:00:00.000Z',
    acceptedAt: null,
    createdAt: '2026-10-07T12:00:00.000Z',
    ...overrides,
  }
}

export const invites: Invite[] = [
  createInviteResponse(),
  createInviteResponse({
    id: 'c7d1a6e3-3a2f-4e8f-8b4d-8f9a0b1c2d3e',
    email: 'bruno@example.com',
    unitLabel: 'A · 31',
    status: 'EXPIRED',
    createdAt: '2026-09-25T12:00:00.000Z',
  }),
  createInviteResponse({
    id: 'd8e2b7f4-4b3a-4f9a-9c5e-9a0b1c2d3e4f',
    email: 'diego@example.com',
    unitLabel: 'A · 12',
    status: 'ACCEPTED',
    acceptedAt: '2026-09-20T12:00:00.000Z',
    createdAt: '2026-09-19T12:00:00.000Z',
  }),
]

export const inviteToken = 'invite-token-123'

export function createInvitePreview(
  overrides: Partial<InvitePreview> = {},
): InvitePreview {
  return {
    organizationName: 'Residencial Aclimação',
    email: 'ana@example.com',
    unitLabel: 'B · 42',
    expiresAt: '2026-10-14T12:00:00.000Z',
    status: 'PENDING',
    ...overrides,
  }
}
