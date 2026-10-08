import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { StrictMode } from 'react'
import { Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { refreshTokenStorageKey } from '@/lib/auth'
import type { AuthUser } from '@/lib/use-auth'
import { createSession, driverUser, managerUser } from '@/testing/mocks/auth'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { EmailLoginRoute } from './email-login'
import { HomeRoute } from './home'
import { LoginRoute } from './login'
import { ProtectedRoot } from './protected-root'

function renderRoutes(route = '/login/email?token=magic-token') {
  return renderApp(
    <StrictMode>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/login/email" element={<EmailLoginRoute />} />
        <Route element={<ProtectedRoot />}>
          <Route path="/" element={<HomeRoute />} />
        </Route>
      </Routes>
    </StrictMode>,
    { route },
  )
}

function mockVerify(user: AuthUser) {
  const verify = vi.fn()
  server.use(
    http.post(`${env.apiUrl}/auth/email-login/verify`, async ({ request }) => {
      verify(await request.json())
      return HttpResponse.json(createSession(user))
    }),
    http.get(`${env.apiUrl}/auth/me`, () => HttpResponse.json(user)),
  )
  return verify
}

describe('EmailLoginRoute', () => {
  it('signs in once with the magic link and opens the overview', async () => {
    const verify = mockVerify(managerUser)
    renderRoutes()

    expect(
      await screen.findByRole('heading', { name: 'Visão geral', level: 1 }),
    ).toBeInTheDocument()
    expect(verify).toHaveBeenCalledTimes(1)
    expect(verify).toHaveBeenCalledWith({ token: 'magic-token' })
    expect(localStorage.getItem(refreshTokenStorageKey)).toBe('refresh-1')
  })

  it('shows the driver notice to drivers', async () => {
    mockVerify(driverUser)
    renderRoutes()

    expect(
      await screen.findByRole('heading', {
        name: 'Use o aplicativo EV ChargeOps',
      }),
    ).toBeInTheDocument()
  })

  it('explains an invalid link and leads back to the login', async () => {
    server.use(
      http.post(
        `${env.apiUrl}/auth/email-login/verify`,
        () => new HttpResponse(null, { status: 401 }),
      ),
    )
    renderRoutes()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este link de acesso é inválido ou expirou.',
    )

    await userEvent.click(screen.getByRole('link', { name: 'Voltar para o login' }))

    expect(
      await screen.findByRole('heading', { name: 'Entrar', level: 1 }),
    ).toBeInTheDocument()
  })

  it('asks the visitor to wait when rate limited', async () => {
    server.use(
      http.post(
        `${env.apiUrl}/auth/email-login/verify`,
        () => new HttpResponse(null, { status: 429 }),
      ),
    )
    renderRoutes()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Muitas tentativas, tente novamente em instantes.',
    )
  })

  it('asks for the email to send a code when there is no token', () => {
    const verify = mockVerify(managerUser)
    renderRoutes('/login/email')

    expect(
      screen.getByRole('heading', { name: 'Entrar com link', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByText('Válido por 10 minutos')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Usar senha' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(verify).not.toHaveBeenCalled()
  })
})
