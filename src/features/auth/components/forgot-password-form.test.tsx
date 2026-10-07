import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import {
  ForgotPasswordForm,
  forgotPasswordSuccessMessage,
} from './forgot-password-form'

async function submitEmail(email: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('E-mail'), email)
  await user.click(screen.getByRole('button', { name: 'Enviar link' }))
}

describe('ForgotPasswordForm', () => {
  it('always shows the same confirmation after the request is accepted', async () => {
    const body = vi.fn()
    server.use(
      http.post(`${env.apiUrl}/auth/password/forgot`, async ({ request }) => {
        body(await request.json())
        return new HttpResponse(null, { status: 202 })
      }),
    )
    renderApp(<ForgotPasswordForm />)

    await submitEmail('marina@example.com')

    expect(
      await screen.findByText(forgotPasswordSuccessMessage),
    ).toBeInTheDocument()
    expect(body).toHaveBeenCalledWith({ email: 'marina@example.com' })
    expect(screen.getByRole('link', { name: 'Voltar para o login' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument()
  })

  it('validates the email before calling the api', async () => {
    const forgot = vi.fn()
    server.use(
      http.post(`${env.apiUrl}/auth/password/forgot`, () => {
        forgot()
        return new HttpResponse(null, { status: 202 })
      }),
    )
    renderApp(<ForgotPasswordForm />)

    await submitEmail('not-an-email')

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(forgot).not.toHaveBeenCalled()
  })

  it('asks the visitor to wait when rate limited', async () => {
    server.use(
      http.post(
        `${env.apiUrl}/auth/password/forgot`,
        () =>
          new HttpResponse(null, { status: 429, headers: { 'Retry-After': '60' } }),
      ),
    )
    renderApp(<ForgotPasswordForm />)

    await submitEmail('marina@example.com')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Muitas tentativas, tente novamente em instantes.',
    )
  })
})
