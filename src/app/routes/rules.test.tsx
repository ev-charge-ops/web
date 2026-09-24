import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { managedOrganization } from '@/testing/mocks/organizations'
import { server } from '@/testing/mocks/server'
import { createTariff } from '@/testing/mocks/tariff'
import { renderApp } from '@/testing/test-utils'

import { RulesRoute } from './rules'

const tariffUrl = `${env.apiUrl}/organizations/${managedOrganization.id}/tariff`

function mockTariff() {
  let body: unknown
  server.use(
    http.get(tariffUrl, () => HttpResponse.json(createTariff())),
    http.patch(tariffUrl, async ({ request }) => {
      body = await request.json()
      return HttpResponse.json(
        createTariff({ ...(body as object), validFrom: '2026-10-07T15:00:00.000Z' }),
      )
    }),
  )
  return { getBody: () => body }
}

describe('RulesRoute', () => {
  it('shows the current tariff in reais', async () => {
    mockTariff()
    renderApp(<RulesRoute />, { route: '/rules' })

    expect(
      await screen.findByLabelText('Tarifa de energia (R$ por kWh)'),
    ).toHaveValue('0,89')
    expect(screen.getByLabelText('Tarifa base de visitantes (R$ por kWh)')).toHaveValue(
      '1,89',
    )
    expect(screen.getByLabelText('Taxa de acesso mensal (R$)')).toHaveValue('35,00')
    expect(screen.getByLabelText('Tolerância após a recarga (minutos)')).toHaveValue(
      '10',
    )
    expect(screen.getByLabelText('Taxa de ocupação (R$ por minuto)')).toHaveValue(
      '0,25',
    )
    expect(screen.getByLabelText('Teto da ocupação por sessão (R$)')).toHaveValue(
      '30,00',
    )
    expect(screen.getByText(/Em vigor desde 01\/01\/2026/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled()
  })

  it('validates the values before saving', async () => {
    const tariff = mockTariff()
    const user = userEvent.setup()
    renderApp(<RulesRoute />, { route: '/rules' })

    const rate = await screen.findByLabelText('Tarifa de energia (R$ por kWh)')
    await user.clear(rate)
    await user.type(rate, 'abc')
    const grace = screen.getByLabelText('Tolerância após a recarga (minutos)')
    await user.clear(grace)
    await user.type(grace, '300')
    const cap = screen.getByLabelText('Teto da ocupação por sessão (R$)')
    await user.clear(cap)
    await user.type(cap, '1500')
    await user.click(screen.getByRole('button', { name: 'Salvar regras' }))

    expect(
      await screen.findByText('Informe a tarifa em reais, como 0,89'),
    ).toBeInTheDocument()
    expect(screen.getByText('Use no máximo 240 minutos')).toBeInTheDocument()
    expect(screen.getByText(/^Use no máximo R\$\s1\.000,00$/)).toBeInTheDocument()
    expect(tariff.getBody()).toBeUndefined()
  })

  it('saves the tariff in cents and confirms with a toast', async () => {
    const tariff = mockTariff()
    const user = userEvent.setup()
    renderApp(<RulesRoute />, { route: '/rules' })

    const rate = await screen.findByLabelText('Tarifa de energia (R$ por kWh)')
    await user.clear(rate)
    await user.type(rate, '0,92')
    await user.clear(screen.getByLabelText('Tarifa base de visitantes (R$ por kWh)'))
    const grace = screen.getByLabelText('Tolerância após a recarga (minutos)')
    await user.clear(grace)
    await user.type(grace, '15')
    await user.click(screen.getByRole('button', { name: 'Salvar regras' }))

    expect(
      await screen.findByText('Regras salvas. Valem para as próximas sessões.'),
    ).toBeInTheDocument()
    expect(tariff.getBody()).toEqual({
      utilityRateCents: 92,
      baseRateCents: null,
      accessFeeCents: 3500,
      idleFeeCentsPerMinute: 25,
      idleFeeCapCents: 3000,
      gracePeriodMinutes: 15,
    })
    expect(screen.getByText(/Em vigor desde 07\/10\/2026/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled()
  })

  it('shows an error toast when the API rejects the change', async () => {
    server.use(
      http.get(tariffUrl, () => HttpResponse.json(createTariff())),
      http.patch(tariffUrl, () =>
        HttpResponse.json({ statusCode: 400 }, { status: 400 }),
      ),
    )
    const user = userEvent.setup()
    renderApp(<RulesRoute />, { route: '/rules' })

    const fee = await screen.findByLabelText('Taxa de ocupação (R$ por minuto)')
    await user.clear(fee)
    await user.type(fee, '0,30')
    await user.click(screen.getByRole('button', { name: 'Salvar regras' }))

    expect(
      await screen.findByText('Confira os valores informados.'),
    ).toBeInTheDocument()
    expect(fee).toHaveValue('0,30')
  })

  it('discards unsaved changes', async () => {
    mockTariff()
    const user = userEvent.setup()
    renderApp(<RulesRoute />, { route: '/rules' })

    const fee = await screen.findByLabelText('Taxa de acesso mensal (R$)')
    await user.clear(fee)
    await user.type(fee, '40')
    await user.click(screen.getByRole('button', { name: 'Descartar' }))

    expect(fee).toHaveValue('35,00')
  })

  it('lets the manager retry when the tariff fails to load', async () => {
    let attempts = 0
    server.use(
      http.get(tariffUrl, () => {
        attempts += 1
        return attempts === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json(createTariff())
      }),
    )
    const user = userEvent.setup()
    renderApp(<RulesRoute />, { route: '/rules' })

    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByLabelText('Tarifa de energia (R$ por kWh)'),
    ).toHaveValue('0,89')
  })
})
