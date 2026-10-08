import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import type { AuthUser } from '@/lib/use-auth'
import { createSession, driverUser, managerUser } from '@/testing/mocks/auth'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { EmailLoginRoute } from './email-login'
import { HomeRoute } from './home'
import { LoginRoute } from './login'
import { ProtectedRoot } from './protected-root'

function renderRoutes(route = '/login') {
  return renderApp(
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/login/email" element={<EmailLoginRoute />} />
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
    screen.getByRole('link', { name: 'Receber link de acesso por e-mail' }),
  )
  await user.type(await screen.findByLabelText('E-mail'), email)
  await user.click(screen.getByRole('button', { name: 'Enviar código' }))
  await user.type(await screen.findByLabelText('Dígito 1 de 6'), '042817')
}

describe('LoginRoute', () => {
  it('switches between the password and the email link pages', async () => {
    const user = userEvent.setup()
    renderRoutes('/login?redirectTo=%2Freports')

    expect(screen.getByLabelText('Senha')).toBeInTheDocument()

    await user.click(
      screen.getByRole('link', { name: 'Receber link de acesso por e-mail' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Entrar com link', level: 1 }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Acesso sem senha, com o mesmo cuidado.'),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Enviar código' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Usar senha' }))
    expect(await screen.findByLabelText('Senha')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Receber link de acesso por e-mail' }),
    ).toHaveAttribute('href', '/login/email?redirectTo=%2Freports')
  })

  it('presents the portal pitch, the forgot password link and the driver note', () => {
    renderRoutes()

    expect(
      screen.getByRole('heading', { name: 'Entrar', level: 1 }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Portal do gestor e do síndico'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Cada kWh com dono, cada vaga livre a tempo.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Rateio por unidade')).toBeInTheDocument()
    expect(screen.getByText('Capacidade elétrica ao vivo')).toBeInTheDocument()
    expect(screen.getByText('Anomalias por IA')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Esqueci a senha' }),
    ).toHaveAttribute('href', '/forgot-password')
    expect(screen.getByText('Motorista?')).toBeInTheDocument()
  })

  it('links to support, the privacy policy and the terms of use', () => {
    renderRoutes()

    const links = screen.getByRole('navigation', {
      name: 'Links institucionais',
    })
    expect(
      within(links).getByRole('link', { name: 'Suporte' }),
    ).toHaveAttribute('href', '/suporte')
    expect(
      within(links).getByRole('link', { name: 'Privacidade' }),
    ).toHaveAttribute('href', '/privacidade')
    expect(within(links).getByRole('link', { name: 'Termos' })).toHaveAttribute(
      'href',
      '/termos',
    )
    expect(
      screen.getByText(
        'SOFTMOON.IO SERVICOS DE INFORMATICA LTDA · CNPJ 29.734.824/0001-77',
      ),
    ).toBeInTheDocument()
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
