import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import {
  AppleSignInCancelledError,
  signInWithApple,
} from '@/lib/apple-sign-in'
import { createSession, driverUser, managerUser } from '@/testing/mocks/auth'
import {
  googleAuthCode,
  googleOAuth,
  resetGoogleOAuth,
} from '@/testing/mocks/google-oauth'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { HomeRoute } from './home'
import { LoginRoute } from './login'
import { ProtectedRoot } from './protected-root'

vi.mock('@react-oauth/google', () => import('@/testing/mocks/google-oauth'))

vi.mock('@/lib/apple-sign-in', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/apple-sign-in')>()),
  signInWithApple: vi.fn(),
}))

const originalEnv = { ...env }
const googleCodeUrl = `${env.apiUrl}/auth/oauth/google/code`

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
    resetGoogleOAuth()
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

  it('signs in with the Google authorization code and follows the redirect', async () => {
    let body: unknown
    server.use(
      http.post(googleCodeUrl, async ({ request }) => {
        body = await request.json()
        await delay(50)
        return HttpResponse.json(createSession(managerUser))
      }),
    )
    const user = userEvent.setup()
    renderRoutes('/login?redirectTo=%2Freports')

    const button = screen.getByRole('button', {
      name: 'Continuar com o Google',
    })
    await user.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(await screen.findByText('Relatórios')).toBeInTheDocument()
    expect(body).toEqual({ code: googleAuthCode })
  })

  it('shows an error when Google rejects the code', async () => {
    server.use(
      http.post(googleCodeUrl, () => new HttpResponse(null, { status: 401 })),
    )
    const user = userEvent.setup()
    renderRoutes()

    await user.click(
      screen.getByRole('button', { name: 'Continuar com o Google' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível validar sua conta do Google.',
    )
    expect(
      screen.getByRole('button', { name: 'Continuar com o Google' }),
    ).toBeEnabled()
  })

  it('explains when Google sign in is not configured on the server', async () => {
    server.use(
      http.post(googleCodeUrl, () =>
        HttpResponse.json(
          {
            statusCode: 503,
            message: 'Google authorization code flow is not configured',
            code: 'GOOGLE_CODE_FLOW_NOT_CONFIGURED',
          },
          { status: 503 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderRoutes()

    await user.click(
      screen.getByRole('button', { name: 'Continuar com o Google' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O login com o Google está indisponível no momento. Use outra forma de acesso.',
    )
  })

  it('stays quiet when the Google popup is closed or denied', async () => {
    googleOAuth.requestCode
      .mockImplementationOnce((options) =>
        options.onNonOAuthError?.({ type: 'popup_closed' }),
      )
      .mockImplementationOnce((options) =>
        options.onError?.({ error: 'access_denied' }),
      )
    const user = userEvent.setup()
    renderRoutes()
    const button = screen.getByRole('button', {
      name: 'Continuar com o Google',
    })

    await user.click(button)
    await user.click(button)

    expect(googleOAuth.requestCode).toHaveBeenCalledTimes(2)
    expect(button).toBeEnabled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an error when the Google popup fails', async () => {
    googleOAuth.requestCode.mockImplementationOnce((options) =>
      options.onNonOAuthError?.({ type: 'popup_failed_to_open' }),
    )
    const user = userEvent.setup()
    renderRoutes()

    await user.click(
      screen.getByRole('button', { name: 'Continuar com o Google' }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível entrar com o Google. Tente novamente.',
    )
  })

  it('shows an error when the Google script did not load', async () => {
    googleOAuth.scriptLoaded = false
    const user = userEvent.setup()
    renderRoutes()

    await user.click(
      screen.getByRole('button', { name: 'Continuar com o Google' }),
    )

    expect(googleOAuth.requestCode).not.toHaveBeenCalled()
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
      await screen.findByRole('heading', { name: 'Visão geral', level: 1 }),
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
