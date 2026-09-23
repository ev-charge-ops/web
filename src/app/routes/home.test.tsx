import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { chargePoints } from '@/testing/mocks/charge-points'
import { managedOrganization } from '@/testing/mocks/organizations'
import { createOverview } from '@/testing/mocks/overview'
import { server } from '@/testing/mocks/server'
import { createSessionPage, organizationSessions } from '@/testing/mocks/sessions'
import { renderApp } from '@/testing/test-utils'
import { formatMonth, getCurrentMonth } from '@/utils/month'

import { HomeRoute } from './home'

const organizationUrl = `${env.apiUrl}/organizations/${managedOrganization.id}`
const normalize = (value: string | null) => value?.replace(/\s/g, ' ')

describe('HomeRoute', () => {
  it('shows the month indicators, capacity, dynamic price and anomalies', async () => {
    let overviewMonth: string | null = null
    server.use(
      http.get(`${organizationUrl}/overview`, ({ request }) => {
        overviewMonth = new URL(request.url).searchParams.get('month')
        return HttpResponse.json(createOverview())
      }),
      http.get(`${organizationUrl}/sessions`, () =>
        HttpResponse.json(createSessionPage(organizationSessions)),
      ),
    )
    renderApp(<HomeRoute />)

    expect(await screen.findByText('1.284,6')).toBeInTheDocument()
    expect(overviewMonth).toBe(getCurrentMonth())
    expect(normalize(screen.getByText(/1\.987,34/).textContent)).toBe(
      'R$ 1.987,34',
    )
    expect(screen.getByText('102')).toBeInTheDocument()
    expect(screen.getByText('14 kW carregando agora')).toBeInTheDocument()
    expect(screen.getByText('34%')).toBeInTheDocument()
    expect(
      screen.getByRole('meter', {
        name: 'Demanda atual sobre o limite contratado',
      }),
    ).toHaveAttribute('aria-valuenow', '25.5')
    expect(
      within(screen.getByRole('list', { name: 'Consumo por semana' })).getAllByRole(
        'listitem',
      ),
    ).toHaveLength(5)

    expect(await screen.findByText('Fator de demanda 0,8×')).toBeInTheDocument()
    expect(screen.getByText('Modelo de IA · v1')).toBeInTheDocument()
    expect(screen.getByText('Fora de pico')).toBeInTheDocument()
    const prices = screen.getByRole('list', { name: 'Preço por ponto' })
    expect(within(prices).getAllByRole('listitem')).toHaveLength(3)
    expect(within(prices).queryByText('Estacionamento público')).not.toBeInTheDocument()
    expect(within(prices).getByText(/^Base R\$\s1,89 × fator$/)).toBeInTheDocument()

    const anomalies = await screen.findByRole('list', { name: 'Anomalias recentes' })
    expect(within(anomalies).getByText('B · 23')).toBeInTheDocument()
    expect(within(anomalies).getByText('Anomalia · 0,91')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver sessões' })).toHaveAttribute(
      'href',
      '/sessions',
    )
  })

  it('recommends a demand upgrade when the average peak is high', async () => {
    server.use(
      http.get(`${organizationUrl}/overview`, () =>
        HttpResponse.json(
          createOverview({
            capacity: {
              ...createOverview().capacity,
              averagePeakDemandKw: 66,
              averagePeakUtilizationPercent: 88,
              upgradeRecommended: true,
            },
          }),
        ),
      ),
    )
    renderApp(<HomeRoute />)

    expect(
      await screen.findByText(
        'O pico médio passa de 80% do limite. Avalie aumentar a demanda contratada.',
      ),
    ).toBeInTheDocument()
  })

  it('explains when there are no anomalies nor priced points', async () => {
    server.use(
      http.get(`${env.apiUrl}/charge-points`, () =>
        HttpResponse.json(chargePoints.map((point) => ({ ...point, pricing: null }))),
      ),
    )
    renderApp(<HomeRoute />)

    expect(
      await screen.findByText(
        `Nenhuma sessão atípica em ${formatMonth(getCurrentMonth())}. O modelo de IA avalia cada sessão quando ela é encerrada.`,
      ),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Nenhum ponto com tarifa configurada neste condomínio.'),
    ).toBeInTheDocument()
  })

  it('lets the manager retry when the indicators fail to load', async () => {
    let attempts = 0
    server.use(
      http.get(`${organizationUrl}/overview`, () => {
        attempts += 1
        return attempts === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json(createOverview())
      }),
    )
    const user = userEvent.setup()
    renderApp(<HomeRoute />)

    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('1.284,6')).toBeInTheDocument()
  })
})
