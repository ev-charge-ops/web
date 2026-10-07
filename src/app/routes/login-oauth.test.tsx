import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import {
  AppleSignInCancelledError,
  signInWithApple,
} from '@/lib/apple-sign-in'
import { createSession, driverUser, managerUser } from '@/testing/mocks/auth'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { HomeRoute } from './home'
import { LoginRoute } from './login'
import { ProtectedRoot } from './protected-root'

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
  GoogleLogin: ({
    onSuccess,
    onError,
  }: {
    onSuccess: (response: { credential?: string }) => void
    onError: () => void
  }) => (
    <>
      <button
        type="button"
        onClick={() => onSuccess({ credential: 'google-id-token' })}
      >
        Continuar com o Google
      </button>
      <button type="button" onClick={onError}>
        Simular falha do Google
      </button>
    </>
  ),
}))

vi.mock('@/lib/apple-sign-in', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/apple-sign-in')>()),
  signInWithApple: vi.fn(),
}))

const originalEnv = { ...env }

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

describe('LoginRoute with OAuth providers', () => {
  beforeEach(() => {
    env.googleClientId = 'google-client-id'
    env.appleServicesId = 'apple-services-id'
    server.use(
      http.get(`${env.apiUrl}/auth/me`, () => HttpResponse.json(managerUser)),
    )
  })

  afterEach(() => {
    Object.assign(env, originalEnv)
  })

  it('hides the provider buttons when they are not configured', () => {
    env.googleClientId = undefined
    env.appleServicesId = undefined
    renderRoutes()

    expect(
      screen.queryByRole('button', { name: 'Continuar com o Google' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Continuar com a Apple' }),
    ).not.toBeInTheDocument()
  })

  it('signs in with the Google ID token and follows the redirect', async () => {
    let body: unknown
    server.use(
      http.post(`${env.apiUrl}/auth/oauth/google`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(createSession(managerUser))
      }),
    )
    const user = userEvent.setup()
    renderRoutes('/login?redirectTo=%2Freports')

    await user.click(
      screen.getByRole('button', { name: 'Continuar com o Google' }),
    )

    expect(await screen.findByText('Relatórios')).toBeInTheDocument()
    expect(body).toEqual({ idToken: 'google-id-token' })
  })

  it('shows an error when Google rejects the token', async () => {
    server.use(
      http.post(
        `${env.apiUrl}/auth/oauth/google`,
        () => new HttpResponse(null, { status: 401 }),
      ),
    )
    const user = userEvent.setup()
    renderRoutes()

    await user.click(
      screen.getByRole('button', { name: 'Continuar com o Google' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível validar sua conta do Google.',
    )
  })

  it('shows an error when the Google button fails', async () => {
    const user = userEvent.setup()
    renderRoutes()

    await user.click(
      screen.getByRole('button', { name: 'Simular falha do Google' }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível entrar com o Google. Tente novamente.',
    )
  })

  it('signs in with Apple sending the name shared on the first login', async () => {
    vi.mocked(signInWithApple).mockResolvedValue({
      identityToken: 'apple-identity-token',
      givenName: 'Marina',
      familyName: 'Costa',
    })
    let body: unknown
    server.use(
      http.post(`${env.apiUrl}/auth/oauth/apple`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(createSession(managerUser))
      }),
    )
    const user = userEvent.setup()
    renderRoutes()

    await user.click(screen.getByRole('button', { name: 'Continuar com a Apple' }))

    expect(
      await screen.findByRole('heading', { name: `Olá, ${managerUser.name}` }),
    ).toBeInTheDocument()
    expect(signInWithApple).toHaveBeenCalledWith({
      clientId: 'apple-services-id',
      redirectUri: `${window.location.origin}/auth/apple/callback`,
    })
    expect(body).toEqual({
      identityToken: 'apple-identity-token',
      fullName: { givenName: 'Marina', familyName: 'Costa' },
    })
  })

  it('omits the name when Apple does not share it', async () => {
    vi.mocked(signInWithApple).mockResolvedValue({
      identityToken: 'apple-identity-token',
    })
    let body: unknown
    server.use(
      http.post(`${env.apiUrl}/auth/oauth/apple`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(createSession(driverUser))
      }),
    )
    const user = userEvent.setup()
    renderRoutes()

    await user.click(screen.getByRole('button', { name: 'Continuar com a Apple' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Use o aplicativo EV ChargeOps',
      }),
    ).toBeInTheDocument()
    expect(body).toEqual({ identityToken: 'apple-identity-token' })
  })

  it('stays quiet when the Apple popup is closed', async () => {
    vi.mocked(signInWithApple).mockRejectedValue(new AppleSignInCancelledError())
    const user = userEvent.setup()
    renderRoutes()

    await user.click(screen.getByRole('button', { name: 'Continuar com a Apple' }))

    expect(
      screen.getByRole('button', { name: 'Continuar com a Apple' }),
    ).toBeEnabled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an error when Apple sign in fails', async () => {
    vi.mocked(signInWithApple).mockRejectedValue(new Error('network'))
    const user = userEvent.setup()
    renderRoutes()

    await user.click(screen.getByRole('button', { name: 'Continuar com a Apple' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível entrar com a Apple. Tente novamente.',
    )
  })
})
