import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { managedOrganization } from '@/testing/mocks/organizations'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { ChargePointsRoute } from './charge-points'

describe('ChargePointsRoute', () => {
  it('shows each point of the organization with live status, charger and price', async () => {
    renderApp(<ChargePointsRoute />, { route: '/charge-points' })

    const points = await screen.findAllByRole('article')
    expect(points).toHaveLength(3)

    const resident = screen.getByRole('article', { name: 'L1-01' })
    expect(
      within(resident).getByText('Garagem L1 · Vaga 12'),
    ).toBeInTheDocument()
    expect(within(resident).getByText('Livre')).toBeInTheDocument()
    expect(within(resident).getByText('Privado · rateio')).toBeInTheDocument()
    expect(within(resident).getByText('GW-HCA-G2-0001')).toBeInTheDocument()
    expect(
      within(resident).getByText('GoodWe HCA G2 · Tipo 2 (AC)'),
    ).toBeInTheDocument()
    expect(within(resident).getByText('7 kW')).toBeInTheDocument()
    expect(within(resident).getByText('R$ 0,89/kWh')).toBeInTheDocument()
    expect(
      within(resident).getByRole('link', { name: 'Ver sessões' }),
    ).toHaveAttribute(
      'href',
      '/sessions?point=5b0e8c1d-2f3a-4b6c-8d7e-9f0a1b2c3d01',
    )

    const visitors = screen.getByRole('article', { name: 'L2-01' })
    expect(within(visitors).getByText('Comercial · cartão')).toBeInTheDocument()
    expect(within(visitors).getByText('Não vinculado')).toBeInTheDocument()
    expect(within(visitors).getByText('R$ 1,51/kWh')).toBeInTheDocument()

    const charging = screen.getByRole('article', { name: 'L1-02' })
    expect(within(charging).getByText('Carregando')).toBeInTheDocument()
    expect(await within(charging).findByText('6,8')).toBeInTheDocument()
    expect(screen.queryByText('Estacionamento público')).not.toBeInTheDocument()
    expect(
      screen.getByRole('meter', {
        name: 'Demanda atual sobre o limite contratado',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/3 pontos · atualizado a cada 30 s/),
    ).toBeInTheDocument()
  })

  it('shows the full load of the points and the dynamic price', async () => {
    renderApp(<ChargePointsRoute />, { route: '/charge-points' })

    expect(
      await screen.findByRole('heading', { name: 'Com os 3 pontos em uso' }),
    ).toBeInTheDocument()
    const bars = screen.getByRole('list', { name: 'Potência máxima por ponto' })
    expect(within(bars).getAllByRole('listitem')).toHaveLength(4)
    expect(within(bars).getByText('36')).toBeInTheDocument()

    const prices = screen.getByRole('list', { name: 'Preço por ponto' })
    expect(within(prices).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('Fator de demanda 0,8×')).toBeInTheDocument()
  })

  it('requests only the points of the managed organization', async () => {
    const organizationIds: (string | null)[] = []
    server.use(
      http.get(`${env.apiUrl}/charge-points`, ({ request }) => {
        organizationIds.push(
          new URL(request.url).searchParams.get('organizationId'),
        )
        return HttpResponse.json([])
      }),
    )
    renderApp(<ChargePointsRoute />, { route: '/charge-points' })

    await screen.findByText('Nenhum ponto de recarga neste condomínio.')
    expect(organizationIds).toEqual([managedOrganization.id])
  })

  it('shows an empty state when the organization has no points', async () => {
    server.use(
      http.get(`${env.apiUrl}/charge-points`, () => HttpResponse.json([])),
    )
    renderApp(<ChargePointsRoute />, { route: '/charge-points' })

    expect(
      await screen.findByText('Nenhum ponto de recarga neste condomínio.'),
    ).toBeInTheDocument()
  })

  it('lets the manager retry when the points fail to load', async () => {
    let attempts = 0
    server.use(
      http.get(`${env.apiUrl}/charge-points`, () => {
        attempts += 1
        return attempts === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json([])
      }),
    )
    const user = userEvent.setup()
    renderApp(<ChargePointsRoute />, { route: '/charge-points' })

    expect(
      await screen.findByText(
        'Não foi possível carregar os pontos de recarga.',
      ),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByText('Nenhum ponto de recarga neste condomínio.'),
    ).toBeInTheDocument()
  })
})
