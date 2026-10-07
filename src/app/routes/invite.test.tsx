import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { refreshTokenStorageKey } from '@/lib/auth'
import type { AuthUser } from '@/lib/use-auth'
import { createSession, driverUser } from '@/testing/mocks/auth'
import { createInvitePreview, inviteToken } from '@/testing/mocks/invites'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { InviteRoute } from './invite'

vi.mock('@react-oauth/google', () => import('@/testing/mocks/google-oauth'))

const inviteUrl = `${env.apiUrl}/invites/${inviteToken}`

const invitedUser: AuthUser = {
  ...driverUser,
  name: 'Ana Souza',
  email: 'ana@example.com',
}

function renderInvite(route = `/invite?token=${inviteToken}`) {
  return renderApp(
    <Routes>
      <Route path="/invite" element={<InviteRoute />} />
      <Route path="/login" element={<p>Tela de login</p>} />
    </Routes>,
    { route },
  )
}

function mockPreview(preview = createInvitePreview()) {
  server.use(http.get(inviteUrl, () => HttpResponse.json(preview)))
}

function mockSession(user: AuthUser) {
  localStorage.setItem(refreshTokenStorageKey, 'refresh-1')
  server.use(
    http.post(`${env.apiUrl}/auth/refresh`, () =>
      HttpResponse.json(createSession(user, '2')),
    ),
    http.post(
      `${env.apiUrl}/auth/logout`,
      () => new HttpResponse(null, { status: 204 }),
    ),
  )
}

async function fillNewAccount() {
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText('Seu nome'), 'Ana Souza')
  await user.type(screen.getByLabelText('Crie uma senha'), 's3cure-passw0rd')
  await user.click(
    screen.getByRole('button', { name: 'Criar conta e aceitar convite' }),
  )
}

describe('InviteRoute', () => {
  afterEach(() => {
    env.googleClientId = undefined
  })

  it('signs in with Google and then accepts with that account', async () => {
    env.googleClientId = 'google-client-id'
    mockPreview()
    let accepted = false
    server.use(
      http.post(`${env.apiUrl}/auth/oauth/google/code`, () =>
        HttpResponse.json(createSession(invitedUser)),
      ),
      http.post(`${inviteUrl}/accept-authenticated`, () => {
        accepted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderInvite()

    await user.click(
      await screen.findByRole('button', { name: 'Continuar com o Google' }),
    )
    await user.click(
      await screen.findByRole('button', { name: 'Aceitar convite' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Baixe o app EV ChargeOps' }),
    ).toBeInTheDocument()
    expect(accepted).toBe(true)
  })

  it('rejects links without a token', () => {
    renderInvite('/invite')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Link de convite inválido.',
    )
  })

  it('shows the invite details and creates the account', async () => {
    mockPreview()
    let body: unknown
    server.use(
      http.post(`${inviteUrl}/accept`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(createSession(invitedUser), { status: 201 })
      }),
    )
    renderInvite()

    expect(await screen.findByText('Residencial Aclimação')).toBeInTheDocument()
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByText('B · 42')).toBeInTheDocument()

    await fillNewAccount()

    expect(
      await screen.findByText(
        'Convite aceito! Você agora faz parte de Residencial Aclimação.',
      ),
    ).toBeInTheDocument()
    expect(body).toEqual({ name: 'Ana Souza', password: 's3cure-passw0rd' })
    expect(
      screen.getByRole('heading', { name: 'Baixe o app EV ChargeOps' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Baixar para Android (APK)' }),
    ).toHaveAttribute(
      'href',
      'https://expo.dev/accounts/ev-charge-ops/projects/ev-charge-ops',
    )
    expect(
      screen.getByText('Convite via TestFlight enviado pelo gestor.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir no app' })).toHaveAttribute(
      'href',
      `evchargeops://invite?token=${inviteToken}`,
    )
    expect(localStorage.getItem(refreshTokenStorageKey)).toBe('refresh-1')
  })

  it('validates the new account form', async () => {
    mockPreview()
    const user = userEvent.setup()
    renderInvite()

    await user.click(
      await screen.findByRole('button', {
        name: 'Criar conta e aceitar convite',
      }),
    )

    expect(screen.getByText('Informe seu nome')).toBeInTheDocument()
    expect(
      screen.getByText('A senha deve ter pelo menos 8 caracteres'),
    ).toBeInTheDocument()
  })

  it('asks existing users to sign in', async () => {
    mockPreview()
    server.use(
      http.post(`${inviteUrl}/accept`, () =>
        HttpResponse.json(
          { statusCode: 409, code: 'EMAIL_ALREADY_REGISTERED' },
          { status: 409 },
        ),
      ),
    )
    renderInvite()

    await fillNewAccount()

    expect(
      await screen.findByText(
        'Este e-mail já tem uma conta. Entre com ela para aceitar o convite.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Entrar na minha conta' }),
    ).toHaveAttribute(
      'href',
      `/login?redirectTo=${encodeURIComponent(`/invite?token=${inviteToken}`)}`,
    )
  })

  it('shows the expired message when accepting returns 410', async () => {
    mockPreview()
    server.use(
      http.post(`${inviteUrl}/accept`, () =>
        HttpResponse.json(
          { statusCode: 410, code: 'INVITE_EXPIRED' },
          { status: 410 },
        ),
      ),
    )
    renderInvite()

    await fillNewAccount()

    expect(
      await screen.findByRole('heading', { name: 'Convite expirado' }),
    ).toBeInTheDocument()
  })

  it.each([
    ['EXPIRED', 'Convite expirado'],
    ['REVOKED', 'Convite revogado'],
    ['ACCEPTED', 'Convite já utilizado'],
  ] as const)('explains %s invites from the preview', async (status, title) => {
    mockPreview(createInvitePreview({ status }))
    renderInvite()

    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.queryByLabelText('Seu nome')).not.toBeInTheDocument()
  })

  it('explains unknown invites', async () => {
    server.use(
      http.get(inviteUrl, () =>
        HttpResponse.json(
          { statusCode: 404, code: 'INVITE_NOT_FOUND' },
          { status: 404 },
        ),
      ),
    )
    renderInvite()

    expect(
      await screen.findByRole('heading', { name: 'Convite não encontrado' }),
    ).toBeInTheDocument()
  })

  it('accepts with the signed in account when the email matches', async () => {
    mockSession(invitedUser)
    mockPreview()
    let authorization: string | null = null
    server.use(
      http.post(`${inviteUrl}/accept-authenticated`, ({ request }) => {
        authorization = request.headers.get('Authorization')
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderInvite()

    await user.click(
      await screen.findByRole('button', { name: 'Aceitar convite' }),
    )

    expect(
      await screen.findByText(
        'Convite aceito! Você agora faz parte de Residencial Aclimação.',
      ),
    ).toBeInTheDocument()
    expect(authorization).toBe('Bearer access-2')
    expect(screen.queryByLabelText('Seu nome')).not.toBeInTheDocument()
  })

  it('treats existing memberships as accepted', async () => {
    mockSession(invitedUser)
    mockPreview()
    server.use(
      http.post(`${inviteUrl}/accept-authenticated`, () =>
        HttpResponse.json(
          { statusCode: 409, code: 'ALREADY_MEMBER' },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderInvite()

    await user.click(
      await screen.findByRole('button', { name: 'Aceitar convite' }),
    )

    expect(
      await screen.findByText('Você já faz parte deste condomínio.'),
    ).toBeInTheDocument()
  })

  it('asks to switch accounts when signed in with another email', async () => {
    mockSession(driverUser)
    mockPreview()
    const user = userEvent.setup()
    renderInvite()

    expect(
      await screen.findByText(
        `Você está conectado como ${driverUser.email}. Saia e entre com ana@example.com para aceitar este convite.`,
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Aceitar convite' }),
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Sair e usar outra conta' }),
    )

    expect(await screen.findByLabelText('Seu nome')).toBeInTheDocument()
  })
})
