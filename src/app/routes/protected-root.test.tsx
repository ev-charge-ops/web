import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { refreshTokenStorageKey } from '@/lib/auth'
import type { AuthUser } from '@/lib/use-auth'
import { createSession, driverUser, managerUser } from '@/testing/mocks/auth'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { HomeRoute } from './home'
import { LoginRoute } from './login'
import { ProtectedRoot } from './protected-root'

function renderRoutes(route = '/') {
  return renderApp(
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<ProtectedRoot />}>
        <Route path="/" element={<HomeRoute />} />
      </Route>
    </Routes>,
    { route },
  )
}

function mockSession(user: AuthUser) {
  localStorage.setItem(refreshTokenStorageKey, 'refresh-1')
  server.use(
    http.post(`${env.apiUrl}/auth/refresh`, () =>
      HttpResponse.json(createSession(user, '2')),
    ),
    http.get(`${env.apiUrl}/auth/me`, () => HttpResponse.json(user)),
    http.post(
      `${env.apiUrl}/auth/logout`,
      () => new HttpResponse(null, { status: 204 }),
    ),
  )
}

describe('ProtectedRoot', () => {
  it('redirects anonymous visitors to the login page', async () => {
    renderRoutes()

    expect(
      await screen.findByRole('heading', { name: 'Entrar no portal' }),
    ).toBeInTheDocument()
  })

  it('shows the overview with the manager name and role', async () => {
    mockSession(managerUser)
    renderRoutes()

    expect(screen.getByRole('status')).toHaveTextContent('Restaurando sessão')
    expect(
      await screen.findByRole('heading', { name: `Olá, ${managerUser.name}` }),
    ).toBeInTheDocument()
    expect(screen.getByText('Gestor do condomínio')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('blocks drivers and lets them sign out', async () => {
    mockSession(driverUser)
    renderRoutes()

    expect(
      await screen.findByRole('heading', {
        name: 'Use o aplicativo EV ChargeOps',
      }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(
      await screen.findByRole('heading', { name: 'Entrar no portal' }),
    ).toBeInTheDocument()
    expect(localStorage.getItem(refreshTokenStorageKey)).toBeNull()
  })

  it('sends authenticated visitors from the login page to the overview', async () => {
    mockSession(managerUser)
    renderRoutes('/login')

    expect(
      await screen.findByRole('heading', { name: `Olá, ${managerUser.name}` }),
    ).toBeInTheDocument()
  })
})
