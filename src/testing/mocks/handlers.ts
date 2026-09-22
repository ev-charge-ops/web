import { http, HttpResponse } from 'msw'

import { env } from '@/config/env'

import { managedOrganization } from './organizations'

export const handlers = [
  http.get(`${env.apiUrl}/health`, () => HttpResponse.json({ status: 'ok' })),
  http.get(`${env.apiUrl}/me/organizations`, () =>
    HttpResponse.json([managedOrganization]),
  ),
]
