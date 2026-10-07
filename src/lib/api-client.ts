import createClient, { type Middleware } from 'openapi-fetch'

import { env } from '@/config/env'

import type { paths } from './api-schema'

type MaybeToken = string | null | undefined

export type AuthHandlers = {
  getAccessToken: () => MaybeToken
  refreshAccessToken?: () => Promise<MaybeToken>
  onRefreshFailure?: () => void
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
  }
}

let authHandlers: AuthHandlers | null = null

export function setAuthHandlers(handlers: AuthHandlers | null) {
  authHandlers = handlers
}

function withBearer(request: Request, token: MaybeToken) {
  if (token) request.headers.set('Authorization', `Bearer ${token}`)
  return request
}

export function createAuthMiddleware(
  getHandlers: () => AuthHandlers | null,
): Middleware {
  const pendingRetries = new Map<string, Request>()
  let refreshInFlight: Promise<MaybeToken> | null = null

  const refreshOnce = (refresh: () => Promise<MaybeToken>) => {
    refreshInFlight ??= refresh().finally(() => {
      refreshInFlight = null
    })
    return refreshInFlight
  }

  return {
    onRequest({ request, id }) {
      const handlers = getHandlers()
      if (!handlers) return request
      const authorized = withBearer(request, handlers.getAccessToken())
      if (handlers.refreshAccessToken) {
        pendingRetries.set(id, authorized.clone())
      }
      return authorized
    },
    async onResponse({ response, id, options }) {
      const retryRequest = pendingRetries.get(id)
      pendingRetries.delete(id)
      const handlers = getHandlers()
      if (
        response.status !== 401 ||
        !retryRequest ||
        !handlers?.refreshAccessToken
      ) {
        return response
      }
      const token = await refreshOnce(handlers.refreshAccessToken).catch(
        () => null,
      )
      if (!token) {
        handlers.onRefreshFailure?.()
        return response
      }
      return options.fetch(withBearer(retryRequest, token))
    },
    onError({ id }) {
      pendingRetries.delete(id)
    },
  }
}

export function createApiClient(baseUrl: string) {
  const client = createClient<paths>({ baseUrl })
  client.use(createAuthMiddleware(() => authHandlers))
  return client
}

export const apiClient = createApiClient(env.apiUrl)

export const publicApiClient = createClient<paths>({ baseUrl: env.apiUrl })
