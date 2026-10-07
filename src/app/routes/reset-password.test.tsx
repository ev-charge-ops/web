import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { ResetPasswordRoute } from './reset-password'

function renderRoute(route = '/reset-password?token=reset-token') {
  return renderApp(
    <Routes>
      <Route path="/reset-password" element={<ResetPasswordRoute />} />
    </Routes>,
    { route },
  )
}

async function submitPasswords(password: string, confirmPassword: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nova senha'), password)
  await user.type(screen.getByLabelText('Confirme a nova senha'), confirmPassword)
  await user.click(screen.getByRole('button', { name: 'Redefinir senha' }))
}

describe('ResetPasswordRoute', () => {
  it('sets the new password and links back to the login', async () => {
    const body = vi.fn()
    server.use(
      http.post(`${env.apiUrl}/auth/password/reset`, async ({ request }) => {
        body(await request.json())
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoute()

    await submitPasswords('n3w-s3cure-passw0rd', 'n3w-s3cure-passw0rd')

    expect(await screen.findByText(/Senha redefinida/)).toBeInTheDocument()
    expect(body).toHaveBeenCalledWith({
      token: 'reset-token',
      password: 'n3w-s3cure-passw0rd',
    })
    expect(
      screen.getByRole('link', { name: 'Entrar com a nova senha' }),
    ).toHaveAttribute('href', '/login')
  })

  it('validates length and confirmation before calling the api', async () => {
    const reset = vi.fn()
    server.use(
      http.post(`${env.apiUrl}/auth/password/reset`, () => {
        reset()
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoute()

    await submitPasswords('1234567', '7654321')

    expect(
      await screen.findByText('A senha deve ter pelo menos 8 caracteres'),
    ).toBeInTheDocument()
    expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument()
    expect(reset).not.toHaveBeenCalled()
  })

  it('explains an invalid or expired token and offers a new link', async () => {
    server.use(
      http.post(
        `${env.apiUrl}/auth/password/reset`,
        () => new HttpResponse(null, { status: 400 }),
      ),
    )
    renderRoute()

    await submitPasswords('n3w-s3cure-passw0rd', 'n3w-s3cure-passw0rd')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este link de redefinição é inválido ou expirou.',
    )
    expect(screen.getByRole('link', { name: 'Solicitar novo link' })).toHaveAttribute(
      'href',
      '/forgot-password',
    )
  })

  it('asks the visitor to wait when rate limited', async () => {
    server.use(
      http.post(
        `${env.apiUrl}/auth/password/reset`,
        () => new HttpResponse(null, { status: 429 }),
      ),
    )
    renderRoute()

    await submitPasswords('n3w-s3cure-passw0rd', 'n3w-s3cure-passw0rd')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Muitas tentativas, tente novamente em instantes.',
    )
  })

  it('shows the invalid link message when the token is missing', () => {
    renderRoute('/reset-password')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Este link de redefinição é inválido ou expirou.',
    )
    expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument()
  })
})
