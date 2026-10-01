import { http, HttpResponse } from 'msw'

import { env } from '@/config/env'

import { chargePoints } from './charge-points'
import { managedOrganization } from './organizations'
import { createOverview } from './overview'
import {
  createSessionDetail,
  createSessionPage,
  organizationSessions,
} from './sessions'
import { createStatement } from './statements'
import { createTariff } from './tariff'

export const handlers = [
  http.get(`${env.apiUrl}/health`, () => HttpResponse.json({ status: 'ok' })),
  http.get(`${env.apiUrl}/me/organizations`, () =>
    HttpResponse.json([managedOrganization]),
  ),
  http.get(`${env.apiUrl}/organizations/:organizationId/overview`, () =>
    HttpResponse.json(createOverview()),
  ),
  http.get(`${env.apiUrl}/organizations/:organizationId/statements`, ({ request }) =>
    HttpResponse.json(
      createStatement({
        month: new URL(request.url).searchParams.get('month') ?? '2026-10',
      }),
    ),
  ),
  http.get(`${env.apiUrl}/organizations/:organizationId/tariff`, () =>
    HttpResponse.json(createTariff()),
  ),
  http.get(`${env.apiUrl}/organizations/:organizationId/sessions`, () =>
    HttpResponse.json(createSessionPage([])),
  ),
  http.get(
    `${env.apiUrl}/organizations/:organizationId/sessions/:sessionId`,
    ({ params }) => {
      const session = organizationSessions.find(({ id }) => id === params.sessionId)
      return session
        ? HttpResponse.json(createSessionDetail(session))
        : HttpResponse.json(
            {
              statusCode: 404,
              error: 'Not Found',
              message: 'Session not found',
              code: 'SESSION_NOT_FOUND',
            },
            { status: 404 },
          )
    },
  ),
  http.get(`${env.apiUrl}/charge-points`, ({ request }) => {
    const organizationId = new URL(request.url).searchParams.get('organizationId')
    return HttpResponse.json(
      organizationId
        ? chargePoints.filter((point) => point.organizationId === organizationId)
        : chargePoints,
    )
  }),
]
