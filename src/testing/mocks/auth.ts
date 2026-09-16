import type { AuthSession, AuthUser } from '@/lib/use-auth'

export const managerUser: AuthUser = {
  id: '6f1c2a52-6d1e-4c43-9a43-1e7f0f6f2b01',
  name: 'Marina Costa',
  email: 'marina@example.com',
  role: 'MANAGER',
}

export const driverUser: AuthUser = {
  id: '0b3a7e9c-2f6e-4b8a-8c1d-5a9e4f7d3c02',
  name: 'Diego Lima',
  email: 'diego@example.com',
  role: 'DRIVER',
}

export function createSession(
  user: AuthUser = managerUser,
  suffix = '1',
): AuthSession {
  return {
    user,
    accessToken: `access-${suffix}`,
    refreshToken: `refresh-${suffix}`,
  }
}
