import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { refreshTokenStorageKey } from '@/lib/auth'
import { createSession } from '@/testing/mocks/auth'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { EmailLoginForm } from './email-login-form'

type User = ReturnType<typeof userEvent.setup>

function mockRequest(status = 202) {
  const request = vi.fn()
  server.use(
    http.post(`${env.apiUrl}/auth/email-login/request`, async ({ request: req }) => {
      request(await req.json())
      return new HttpResponse(null, { status })
    }),
  )
  return request
}

async function requestCode(user: User, email = 'marina@example.com') {
  await user.type(screen.getByLabelText('E-mail'), email)
  await user.click(screen.getByRole('button', { name: 'Enviar código' }))
  await screen.findByRole('group', { name: 'Código de acesso' })
}

describe('EmailLoginForm', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('signs in with the pasted code', async () => {
    const request = mockRequest()
    const verify = vi.fn()
    const session = createSession()
    server.use(
      http.post(`${env.apiUrl}/auth/email-login/verify`, async ({ request: req }) => {
        verify(await req.json())
        return HttpResponse.json(session)
      }),
    )
    const user = userEvent.setup()
    renderApp(<EmailLoginForm />)

    await requestCode(user)
    expect(request).toHaveBeenCalledWith({ email: 'marina@example.com' })
    expect(screen.getByText('marina@example.com')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Dígito 1 de 6'))
    await user.paste('042817')

    await waitFor(() =>
      expect(localStorage.getItem(refreshTokenStorageKey)).toBe(
        session.refreshToken,
      ),
    )
    expect(verify).toHaveBeenCalledTimes(1)
    expect(verify).toHaveBeenCalledWith({
      email: 'marina@example.com',
      code: '042817',
    })
  })

  it('shows a generic error and clears the code when it is rejected', async () => {
    mockRequest()
    server.use(
      http.post(
        `${env.apiUrl}/auth/email-login/verify`,
        () => new HttpResponse(null, { status: 401 }),
      ),
    )
    const user = userEvent.setup()
    renderApp(<EmailLoginForm />)

    await requestCode(user)
    await user.type(screen.getByLabelText('Dígito 1 de 6'), '111111')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Código inválido ou expirado',
    )
    expect(screen.getByLabelText('Dígito 1 de 6')).toHaveValue('')
    expect(screen.getByLabelText('Dígito 1 de 6')).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()
  })

  it('asks the visitor to wait when the code request is rate limited', async () => {
    mockRequest(429)
    const user = userEvent.setup()
    renderApp(<EmailLoginForm />)

    await user.type(screen.getByLabelText('E-mail'), 'marina@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Muitas tentativas, tente novamente em instantes.',
    )
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('validates the email before requesting a code', async () => {
    const request = mockRequest()
    const user = userEvent.setup()
    renderApp(<EmailLoginForm />)

    await user.type(screen.getByLabelText('E-mail'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(request).not.toHaveBeenCalled()
  })

  it('lets the visitor resend the code after a 30 second cooldown', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const request = mockRequest()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp(<EmailLoginForm />)

    await requestCode(user)

    expect(
      screen.getByRole('button', { name: /Reenviar código em 30s/ }),
    ).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(29_000)
    })
    expect(
      screen.getByRole('button', { name: /Reenviar código em \d+s/ }),
    ).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(1_500)
    })
    const resend = screen.getByRole('button', { name: 'Reenviar código' })
    expect(resend).toBeEnabled()

    await user.click(resend)

    expect(
      await screen.findByText('Enviamos um novo código para marina@example.com.'),
    ).toBeInTheDocument()
    expect(request).toHaveBeenCalledTimes(2)
    expect(
      screen.getByRole('button', { name: /Reenviar código em 30s/ }),
    ).toBeDisabled()
  })

  it('goes back to the email step', async () => {
    mockRequest()
    const user = userEvent.setup()
    renderApp(<EmailLoginForm />)

    await requestCode(user)
    await user.click(screen.getByRole('button', { name: 'Usar outro e-mail' }))

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })
})
