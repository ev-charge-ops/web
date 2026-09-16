import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { createSession, managerUser } from '@/testing/mocks/auth'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { apiClient } from './api-client'
import { refreshTokenStorageKey } from './auth'
import { useAuth } from './use-auth'

function SessionProbe() {
  const { status, user, signOut } = useAuth()
  return (
    <div>
      <p>status: {status}</p>
      <p>user: {user?.name ?? 'none'}</p>
      <button type="button" onClick={() => void signOut()}>
        sign out
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  it('starts anonymous without a stored refresh token', () => {
    renderApp(<SessionProbe />)

    expect(screen.getByText('status: anonymous')).toBeInTheDocument()
  })

  it('restores the session and stores the rotated refresh token', async () => {
    localStorage.setItem(refreshTokenStorageKey, 'refresh-old')
    const refresh = vi.fn()
    server.use(
      http.post(`${env.apiUrl}/auth/refresh`, async ({ request }) => {
        refresh(await request.json())
        return HttpResponse.json(createSession(managerUser, 'new'))
      }),
    )

    renderApp(<SessionProbe />)

    expect(screen.getByText('status: loading')).toBeInTheDocument()
    expect(await screen.findByText('status: authenticated')).toBeInTheDocument()
    expect(screen.getByText(`user: ${managerUser.name}`)).toBeInTheDocument()
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(refresh).toHaveBeenCalledWith({ refreshToken: 'refresh-old' })
    expect(localStorage.getItem(refreshTokenStorageKey)).toBe('refresh-new')
  })

  it('clears the stored token when the session cannot be restored', async () => {
    localStorage.setItem(refreshTokenStorageKey, 'refresh-revoked')
    server.use(
      http.post(
        `${env.apiUrl}/auth/refresh`,
        () => new HttpResponse(null, { status: 401 }),
      ),
    )

    renderApp(<SessionProbe />)

    expect(await screen.findByText('status: anonymous')).toBeInTheDocument()
    expect(localStorage.getItem(refreshTokenStorageKey)).toBeNull()
  })

  it('sends the in-memory access token and refreshes it after a 401', async () => {
    localStorage.setItem(refreshTokenStorageKey, 'refresh-1')
    let refreshCount = 0
    server.use(
      http.post(`${env.apiUrl}/auth/refresh`, () => {
        refreshCount += 1
        return HttpResponse.json(createSession(managerUser, `${refreshCount + 1}`))
      }),
      http.get(`${env.apiUrl}/auth/me`, ({ request }) =>
        request.headers.get('Authorization') === 'Bearer access-3'
          ? HttpResponse.json(managerUser)
          : new HttpResponse(null, { status: 401 }),
      ),
    )
    renderApp(<SessionProbe />)
    await screen.findByText('status: authenticated')

    const { data } = await apiClient.GET('/auth/me')

    expect(data).toEqual(managerUser)
    expect(refreshCount).toBe(2)
    expect(localStorage.getItem(refreshTokenStorageKey)).toBe('refresh-3')
  })

  it('signs out when the access token cannot be refreshed', async () => {
    localStorage.setItem(refreshTokenStorageKey, 'refresh-1')
    let refreshCount = 0
    server.use(
      http.post(`${env.apiUrl}/auth/refresh`, () => {
        refreshCount += 1
        return refreshCount === 1
          ? HttpResponse.json(createSession(managerUser, '2'))
          : new HttpResponse(null, { status: 401 })
      }),
      http.get(
        `${env.apiUrl}/auth/me`,
        () => new HttpResponse(null, { status: 401 }),
      ),
    )
    renderApp(<SessionProbe />)
    await screen.findByText('status: authenticated')

    await apiClient.GET('/auth/me')

    expect(await screen.findByText('status: anonymous')).toBeInTheDocument()
    expect(localStorage.getItem(refreshTokenStorageKey)).toBeNull()
  })

  it('revokes the refresh token on sign out', async () => {
    localStorage.setItem(refreshTokenStorageKey, 'refresh-1')
    const logout = vi.fn()
    server.use(
      http.post(`${env.apiUrl}/auth/refresh`, () =>
        HttpResponse.json(createSession(managerUser, '2')),
      ),
      http.post(`${env.apiUrl}/auth/logout`, async ({ request }) => {
        logout(await request.json())
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderApp(<SessionProbe />)
    await screen.findByText('status: authenticated')

    await userEvent.click(screen.getByRole('button', { name: 'sign out' }))

    await waitFor(() =>
      expect(screen.getByText('status: anonymous')).toBeInTheDocument(),
    )
    expect(logout).toHaveBeenCalledWith({ refreshToken: 'refresh-2' })
    expect(localStorage.getItem(refreshTokenStorageKey)).toBeNull()
  })
})
