import { http, HttpResponse } from 'msw'

import { env } from '@/config/env'

import { chargePoints } from './charge-points'
import { managedOrganization } from './organizations'
import { createOverview } from './overview'
import { createSessionPage } from './sessions'

export const handlers = [
  http.get(`${env.apiUrl}/health`, () => HttpResponse.json({ status: 'ok' })),
  http.get(`${env.apiUrl}/me/organizations`, () =>
    HttpResponse.json([managedOrganization]),
  ),
  http.get(`${env.apiUrl}/organizations/:organizationId/overview`, () =>
    HttpResponse.json(createOverview()),
  ),
  http.get(`${env.apiUrl}/organizations/:organizationId/sessions`, () =>
    HttpResponse.json(createSessionPage([])),
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
