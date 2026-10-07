import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { refreshTokenStorageKey } from '@/lib/auth'
import { createSession } from '@/testing/mocks/auth'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { LoginForm } from './login-form'

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('E-mail'), email)
  await user.type(screen.getByLabelText('Senha'), password)
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('LoginForm', () => {
  it('signs in and calls onSuccess with the session', async () => {
    const session = createSession()
    const body = vi.fn()
    server.use(
      http.post(`${env.apiUrl}/auth/login`, async ({ request }) => {
        body(await request.json())
        await delay(50)
        return HttpResponse.json(session)
      }),
    )
    const onSuccess = vi.fn()
    renderApp(<LoginForm onSuccess={onSuccess} />)

    await fillAndSubmit('marina@example.com', 's3cure-passw0rd')

    expect(await screen.findByRole('button', { name: /Entrar/ })).toBeDisabled()
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(session))
    expect(body).toHaveBeenCalledWith({
      email: 'marina@example.com',
      password: 's3cure-passw0rd',
    })
    expect(localStorage.getItem(refreshTokenStorageKey)).toBe(
      session.refreshToken,
    )
  })

  it('shows a generic error on invalid credentials', async () => {
    server.use(
      http.post(
        `${env.apiUrl}/auth/login`,
        () => new HttpResponse(null, { status: 401 }),
      ),
    )
    const onSuccess = vi.fn()
    renderApp(<LoginForm onSuccess={onSuccess} />)

    await fillAndSubmit('marina@example.com', 'wrong-password')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha inválidos',
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('asks the visitor to wait when rate limited', async () => {
    server.use(
      http.post(
        `${env.apiUrl}/auth/login`,
        () => new HttpResponse(null, { status: 429 }),
      ),
    )
    renderApp(<LoginForm />)

    await fillAndSubmit('marina@example.com', 's3cure-passw0rd')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Muitas tentativas, tente novamente em instantes.',
    )
  })

  it('links to the password recovery page', () => {
    renderApp(<LoginForm />)

    expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toHaveAttribute(
      'href',
      '/forgot-password',
    )
  })

  it('validates the fields before calling the api', async () => {
    const login = vi.fn()
    server.use(
      http.post(`${env.apiUrl}/auth/login`, () => {
        login()
        return HttpResponse.json(createSession())
      }),
    )
    renderApp(<LoginForm />)

    await fillAndSubmit('not-an-email', '1234567')

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(
      screen.getByText('A senha deve ter pelo menos 8 caracteres'),
    ).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })
})
