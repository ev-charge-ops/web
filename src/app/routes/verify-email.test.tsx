import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { StrictMode } from 'react'
import { Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { refreshTokenStorageKey } from '@/lib/auth'
import { createSession, managerUser } from '@/testing/mocks/auth'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { HomeRoute } from './home'
import { ProtectedRoot } from './protected-root'
import { VerifyEmailRoute } from './verify-email'

function renderRoutes(route = '/verify-email?token=verify-token') {
  return renderApp(
    <StrictMode>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailRoute />} />
        <Route element={<ProtectedRoot />}>
          <Route path="/" element={<HomeRoute />} />
        </Route>
      </Routes>
    </StrictMode>,
    { route },
  )
}

function mockConfirm(status: number) {
  const confirm = vi.fn()
  server.use(
    http.post(
      `${env.apiUrl}/auth/email-verification/confirm`,
      async ({ request }) => {
        confirm(await request.json())
        return new HttpResponse(null, { status })
      },
    ),
  )
  return confirm
}

describe('VerifyEmailRoute', () => {
  it('confirms the email exactly once and links to the login', async () => {
    const confirm = mockConfirm(204)
    renderRoutes()

    expect(screen.getByText('Confirmando seu e-mail')).toBeInTheDocument()
    expect(await screen.findByText(/E-mail confirmado/)).toBeInTheDocument()
    expect(confirm).toHaveBeenCalledTimes(1)
    expect(confirm).toHaveBeenCalledWith({ token: 'verify-token' })
    expect(screen.getByRole('link', { name: 'Ir para o login' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('explains an invalid or expired link', async () => {
    mockConfirm(400)
    renderRoutes()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este link de verificação é inválido ou expirou.',
    )
  })

  it('asks the visitor to wait when rate limited', async () => {
    mockConfirm(429)
    renderRoutes()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Muitas tentativas, tente novamente em instantes.',
    )
  })

  it('does not call the api without a token', () => {
    const confirm = mockConfirm(204)
    renderRoutes('/verify-email')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Este link de verificação é inválido ou expirou.',
    )
    expect(confirm).not.toHaveBeenCalled()
  })

  it('refreshes the signed-in manager so the banner disappears', async () => {
    const unverified = { ...managerUser, emailVerified: false }
    let verified = false
    const me = vi.fn()
    localStorage.setItem(refreshTokenStorageKey, 'refresh-1')
    server.use(
      http.post(`${env.apiUrl}/auth/refresh`, () =>
        HttpResponse.json(createSession(unverified, '2')),
      ),
      http.get(`${env.apiUrl}/auth/me`, () => {
        me(verified)
        return HttpResponse.json({ ...managerUser, emailVerified: verified })
      }),
      http.post(`${env.apiUrl}/auth/email-verification/confirm`, () => {
        verified = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoutes()

    const portalLink = await screen.findByRole('link', {
      name: 'Ir para o portal',
    })
    await waitFor(() => expect(me).toHaveBeenCalledWith(true))
    await userEvent.click(portalLink)

    expect(
      await screen.findByRole('heading', { name: 'Visão geral', level: 1 }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Verificação de e-mail' }),
    ).not.toBeInTheDocument()
  })
})
