import { http, HttpResponse } from 'msw'

import { env } from '@/config/env'

export const handlers = [
  http.get(`${env.apiUrl}/health`, () => HttpResponse.json({ status: 'ok' })),
]
