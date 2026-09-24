import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { ChargePointsRoute } from './charge-points'

describe('ChargePointsRoute', () => {
  it('shows each point of the organization with charger and current price', async () => {
    renderApp(<ChargePointsRoute />, { route: '/charge-points' })

    const points = await screen.findAllByRole('article')
    expect(points).toHaveLength(3)

    const resident = screen.getByRole('article', { name: 'Garagem L1 · Vaga 12' })
    expect(within(resident).getByText('Disponível')).toBeInTheDocument()
    expect(within(resident).getByText('Moradores · rateio')).toBeInTheDocument()
    expect(within(resident).getByText('GoodWe HCA G2')).toBeInTheDocument()
    expect(within(resident).getByText('GW-HCA-G2-0001')).toBeInTheDocument()
    expect(within(resident).getByText('Tipo 2 (AC)')).toBeInTheDocument()
    expect(within(resident).getByText('7 kW')).toBeInTheDocument()
    expect(within(resident).getByText('Fora de pico · 0,8×')).toBeInTheDocument()
    expect(
      within(resident).getByText('Modelo de IA · v1 · informativo'),
    ).toBeInTheDocument()

    const visitors = screen.getByRole('article', { name: 'Garagem L2 · Visitantes' })
    expect(within(visitors).getByText('Visitantes · cartão')).toBeInTheDocument()
    expect(within(visitors).getByText('Não vinculado')).toBeInTheDocument()
    expect(within(visitors).getByText(/1,51/)).toBeInTheDocument()
    expect(within(visitors).getByText('Modelo de IA · v1')).toBeInTheDocument()

    expect(screen.getByRole('article', { name: 'Garagem L1 · Vaga 13' })).toHaveTextContent(
      'Carregando',
    )
    expect(screen.queryByText('Estacionamento público')).not.toBeInTheDocument()
    expect(
      await screen.findByRole('meter', {
        name: 'Demanda atual sobre o limite contratado',
      }),
    ).toBeInTheDocument()
  })

  it('shows an empty state when the organization has no points', async () => {
    server.use(http.get(`${env.apiUrl}/charge-points`, () => HttpResponse.json([])))
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
      await screen.findByText('Não foi possível carregar os pontos de recarga.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByText('Nenhum ponto de recarga neste condomínio.'),
    ).toBeInTheDocument()
  })
})
