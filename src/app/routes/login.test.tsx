import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import type { AuthUser } from '@/lib/use-auth'
import { createSession, driverUser, managerUser } from '@/testing/mocks/auth'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { HomeRoute } from './home'
import { LoginRoute } from './login'
import { ProtectedRoot } from './protected-root'

function renderRoutes(route = '/login') {
  return renderApp(
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<ProtectedRoot />}>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/reports" element={<p>Relatórios</p>} />
      </Route>
    </Routes>,
    { route },
  )
}

function mockEmailLogin(user: AuthUser) {
  server.use(
    http.post(
      `${env.apiUrl}/auth/email-login/request`,
      () => new HttpResponse(null, { status: 202 }),
    ),
    http.post(`${env.apiUrl}/auth/email-login/verify`, () =>
      HttpResponse.json(createSession(user)),
    ),
    http.get(`${env.apiUrl}/auth/me`, () => HttpResponse.json(user)),
  )
}

async function signInWithCode(email: string) {
  const user = userEvent.setup()
  await user.click(
    screen.getByRole('button', { name: 'Entrar com código por e-mail' }),
  )
  await user.type(screen.getByLabelText('E-mail'), email)
  await user.click(screen.getByRole('button', { name: 'Enviar código' }))
  await user.type(await screen.findByLabelText('Dígito 1 de 6'), '042817')
}

describe('LoginRoute', () => {
  it('switches between password and email code methods', async () => {
    const user = userEvent.setup()
    renderRoutes()

    expect(screen.getByLabelText('Senha')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Entrar com código por e-mail' }),
    )
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar código' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Entrar com senha' }))
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })

  it('links to the privacy policy and terms of use', () => {
    renderRoutes()

    expect(
      screen.getByRole('link', { name: 'Política de Privacidade' }),
    ).toHaveAttribute('href', '/privacidade')
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute(
      'href',
      '/termos',
    )
  })

  it('signs in with an email code and follows the redirect target', async () => {
    mockEmailLogin(managerUser)
    renderRoutes('/login?redirectTo=%2Freports')

    await signInWithCode(managerUser.email)

    expect(await screen.findByText('Relatórios')).toBeInTheDocument()
  })

  it('shows the driver notice after a driver signs in with a code', async () => {
    mockEmailLogin(driverUser)
    renderRoutes()

    await signInWithCode(driverUser.email)

    expect(
      await screen.findByRole('heading', {
        name: 'Use o aplicativo EV ChargeOps',
      }),
    ).toBeInTheDocument()
  })
})
