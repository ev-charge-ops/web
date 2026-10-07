import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { server } from '@/testing/mocks/server'

import { createApiClient, setAuthHandlers } from './api-client'

const baseUrl = 'http://api.test'

type Client = {
  GET: (path: string) => Promise<{ data?: unknown; response: Response }>
}

const createClient = () => createApiClient(baseUrl) as unknown as Client

describe('apiClient', () => {
  afterEach(() => setAuthHandlers(null))

  it('sends the access token as a Bearer header', async () => {
    server.use(
      http.get(`${baseUrl}/me`, ({ request }) =>
        HttpResponse.json({ auth: request.headers.get('Authorization') }),
      ),
    )
    setAuthHandlers({ getAccessToken: () => 'token-1' })

    const { data } = await createClient().GET('/me')

    expect(data).toEqual({ auth: 'Bearer token-1' })
  })

  it('omits the Authorization header without a token', async () => {
    server.use(
      http.get(`${baseUrl}/me`, ({ request }) =>
        HttpResponse.json({ auth: request.headers.get('Authorization') }),
      ),
    )

    const { data } = await createClient().GET('/me')

    expect(data).toEqual({ auth: null })
  })

  it('refreshes the token once and retries after a 401', async () => {
    server.use(
      http.get(`${baseUrl}/me`, ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh'
          ? HttpResponse.json({ ok: true })
          : new HttpResponse(null, { status: 401 }),
      ),
    )
    const refreshAccessToken = vi.fn().mockResolvedValue('fresh')
    setAuthHandlers({ getAccessToken: () => 'stale', refreshAccessToken })

    const { data, response } = await createClient().GET('/me')

    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(data).toEqual({ ok: true })
  })

  it('notifies when the refresh fails', async () => {
    server.use(
      http.get(`${baseUrl}/me`, () => new HttpResponse(null, { status: 401 })),
    )
    const onRefreshFailure = vi.fn()
    setAuthHandlers({
      getAccessToken: () => 'stale',
      refreshAccessToken: vi.fn().mockResolvedValue(null),
      onRefreshFailure,
    })

    const { response } = await createClient().GET('/me')

    expect(response.status).toBe(401)
    expect(onRefreshFailure).toHaveBeenCalledTimes(1)
  })
})
