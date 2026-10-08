import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { managedOrganization } from '@/testing/mocks/organizations'
import {
  createOverview,
  createRecentAnomaly,
  overviewChargePoints,
} from '@/testing/mocks/overview'
import { server } from '@/testing/mocks/server'
import { createSessionDetail, flaggedSession } from '@/testing/mocks/sessions'
import { createStatement } from '@/testing/mocks/statements'
import { renderApp } from '@/testing/test-utils'
import {
  formatMonth,
  formatMonthName,
  formatMonthTitle,
  getCurrentMonth,
  shiftMonth,
} from '@/utils/month'

import { HomeRoute } from './home'

const organizationUrl = `${env.apiUrl}/organizations/${managedOrganization.id}`
const currentMonth = getCurrentMonth()
const previousMonth = shiftMonth(currentMonth, -1)
const previousMonthName = formatMonthName(previousMonth)

const liveChargePoints = overviewChargePoints.map((point) =>
  point.code === 'L2-01'
    ? {
        ...point,
        status: 'IDLE' as const,
        activeSession: {
          sessionId: 'a7f3c2d1-0b9e-4c8d-9f7a-6e5d4c3b2a10',
          status: 'GRACE' as const,
          graceEndsAt: new Date(Date.now() + 8 * 60_000).toISOString(),
        },
      }
    : point,
)

function mockOverviewApi({
  overview = createOverview({ chargePoints: liveChargePoints }),
  previousOverview = createOverview({ anomaliesCount: 1 }),
}: {
  overview?: ReturnType<typeof createOverview>
  previousOverview?: ReturnType<typeof createOverview>
} = {}) {
  const overviewMonths: (string | null)[] = []
  server.use(
    http.get(`${organizationUrl}/overview`, ({ request }) => {
      const month = new URL(request.url).searchParams.get('month')
      overviewMonths.push(month)
      return HttpResponse.json(month === previousMonth ? previousOverview : overview)
    }),
    http.get(`${organizationUrl}/statements`, ({ request }) => {
      const month = new URL(request.url).searchParams.get('month')
      return HttpResponse.json(
        month === previousMonth
          ? createStatement({
              month,
              totals: {
                ...createStatement().totals,
                sessionsCount: 4,
                energyKwh: 40,
                energyCents: 3560,
              },
            })
          : createStatement(),
      )
    }),
  )
  return overviewMonths
}

describe('HomeRoute', () => {
  it('shows what is happening now, the capacity and the month indicators', async () => {
    const overviewMonths = mockOverviewApi()
    renderApp(<HomeRoute />)

    expect(
      await screen.findByRole('heading', { name: '2 de 3 pontos em uso' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Visão geral', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(formatMonthTitle(currentMonth))).toBeInTheDocument()
    expect(overviewMonths).toContain(currentMonth)

    const live = screen.getByRole('list', { name: 'Pontos em uso agora' })
    expect(within(live).getByText('L1-02 carregando · 6,8 kW')).toBeInTheDocument()
    expect(
      within(live).getByText(/^L2-01 em tolerância · 0[78]:\d\d$/),
    ).toBeInTheDocument()

    const capacity = screen.getByRole('region', { name: 'Capacidade elétrica' })
    expect(capacity).toHaveTextContent(
      'Demanda contratada 75 kW · reserva de área comum 11,5 kW',
    )
    expect(within(capacity).getByText('Folga')).toBeInTheDocument()
    expect(within(capacity).getByText('6,8')).toBeInTheDocument()
    expect(within(capacity).getByText('de 63,5 kW para recarga')).toBeInTheDocument()
    expect(within(capacity).getByText('L1-02 · 6,8 kW')).toBeInTheDocument()
    expect(
      within(capacity).getByRole('meter', {
        name: 'Demanda atual sobre o limite contratado',
      }),
    ).toHaveAttribute('aria-valuenow', '25.5')
    expect(capacity).toHaveTextContent(
      'Pico do mês: 41,2 kW em 18/10 às 19:40. Sem necessidade de aumento de demanda.',
    )

    const energy = screen.getByRole('region', { name: 'Energia das unidades' })
    expect(await within(energy).findByText('50,8')).toBeInTheDocument()
    expect(energy).toHaveTextContent(`+27% vs. ${previousMonthName}`)

    const sessions = screen.getByRole('region', { name: 'Sessões' })
    expect(within(sessions).getByText('4')).toBeInTheDocument()
    expect(within(sessions).getByText('+ 7 de visitantes (cartão)')).toBeInTheDocument()

    const cost = screen.getByRole('region', { name: 'Energia repassada' })
    expect(within(cost).getByText('45,26')).toBeInTheDocument()
    expect(await within(cost).findByText(/a custo · R\$\s0,89\/kWh/)).toBeInTheDocument()

    const anomalies = screen.getByRole('region', { name: 'Anomalias' })
    expect(within(anomalies).getByText('3')).toBeInTheDocument()
    expect(within(anomalies).getByText('1 para revisar')).toBeInTheDocument()
    expect(
      await within(anomalies).findByText(`+2 vs. ${previousMonthName}`),
    ).toBeInTheDocument()

    expect(
      within(screen.getByRole('list', { name: 'Energia por semana' })).getAllByRole(
        'listitem',
      ),
    ).toHaveLength(5)
    expect(screen.getByRole('listitem', { name: 'Dias 8–14: 372,8 kWh' })).toBeInTheDocument()
  })

  it('lists the detected anomalies with the review action', async () => {
    mockOverviewApi()
    renderApp(<HomeRoute />)

    const list = await screen.findByRole('list', { name: 'Anomalias detectadas' })
    expect(within(list).getByText('Sessão atípica · unidade B · 23')).toBeInTheDocument()
    expect(within(list).getByText(/^L1-02 · .* · score 0,91$/)).toBeInTheDocument()
    expect(
      within(list).getByRole('button', { name: 'Revisar a sessão de Verônica Alencar' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'O score vem do modelo de detecção de anomalias; nenhuma cobrança muda sem revisão do gestor.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver sessões' })).toHaveAttribute(
      'href',
      '/sessions?anomaly=true',
    )
  })

  it('confirms an anomaly from the review drawer', async () => {
    mockOverviewApi()
    let reviewBody: unknown
    server.use(
      http.post(
        `${organizationUrl}/sessions/${flaggedSession.id}/anomaly-review`,
        async ({ request }) => {
          reviewBody = await request.json()
          const reviewed = createSessionDetail(flaggedSession, {
            anomalyReviewStatus: 'CONFIRMED',
            anomalyReviewedAt: new Date().toISOString(),
          })
          server.use(
            http.get(`${organizationUrl}/overview`, () =>
              HttpResponse.json(
                createOverview({
                  anomaliesPendingReviewCount: 0,
                  recentAnomalies: [
                    createRecentAnomaly({ anomalyReviewStatus: 'CONFIRMED' }),
                  ],
                }),
              ),
            ),
          )
          return HttpResponse.json(reviewed)
        },
      ),
    )
    const user = userEvent.setup()
    renderApp(<HomeRoute />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Revisar a sessão de Verônica Alencar',
      }),
    )
    const drawer = screen.getByRole('dialog', { name: 'Revisar anomalia' })
    expect(
      within(drawer).getByText('Sessão atípica · unidade B · 23'),
    ).toBeInTheDocument()
    await user.click(within(drawer).getByRole('button', { name: 'Confirmar anomalia' }))

    expect(await screen.findByText('Anomalia confirmada.')).toBeInTheDocument()
    expect(reviewBody).toEqual({ status: 'CONFIRMED' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      await screen.findByRole('button', {
        name: 'Anomalia confirmada: revisar de novo a sessão de Verônica Alencar',
      }),
    ).toHaveTextContent('Confirmada')
    expect(
      within(screen.getByRole('region', { name: 'Anomalias' })).getByText(
        'nenhuma para revisar',
      ),
    ).toBeInTheDocument()
  })

  it('labels the anomalies scored by the rule fallback', async () => {
    mockOverviewApi({
      overview: createOverview({
        anomaliesCount: 1,
        recentAnomalies: [createRecentAnomaly({ anomalyModelVersion: null })],
      }),
    })
    renderApp(<HomeRoute />)

    const list = await screen.findByRole('list', { name: 'Anomalias detectadas' })
    expect(within(list).getByText(/score 0,91 \(regra\)$/)).toBeInTheDocument()
  })

  it('warns when the building is close to the contracted demand', async () => {
    const base = createOverview()
    mockOverviewApi({
      overview: createOverview({
        capacity: {
          ...base.capacity,
          currentDemandKw: 64,
          utilizationPercent: 85.3,
          averagePeakDemandKw: 66,
          averagePeakUtilizationPercent: 88,
          upgradeRecommended: true,
        },
      }),
    })
    renderApp(<HomeRoute />)

    const capacity = await screen.findByRole('region', { name: 'Capacidade elétrica' })
    expect(within(capacity).getByText('Perto do limite')).toBeInTheDocument()
    expect(capacity).toHaveTextContent('Avalie aumentar a demanda contratada.')
  })

  it('explains when nothing is in use and there are no anomalies', async () => {
    mockOverviewApi({
      overview: createOverview({
        anomaliesCount: 0,
        anomaliesPendingReviewCount: 0,
        recentAnomalies: [],
        chargePoints: overviewChargePoints.map((point) => ({
          ...point,
          status: 'AVAILABLE',
          currentPowerKw: 0,
          activeSession: null,
        })),
      }),
    })
    renderApp(<HomeRoute />)

    expect(
      await screen.findByRole('heading', { name: '0 de 3 pontos em uso' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Todos os pontos livres')).toBeInTheDocument()
    expect(
      screen.getByText(
        `Nenhuma sessão atípica em ${formatMonth(currentMonth)}. O modelo de IA avalia cada sessão quando ela é encerrada.`,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('nenhuma para revisar')).toBeInTheDocument()
  })

  it('loads the overview of the chosen month', async () => {
    const overviewMonths = mockOverviewApi()
    const user = userEvent.setup()
    renderApp(<HomeRoute />)

    await screen.findByRole('heading', { name: '2 de 3 pontos em uso' })
    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))

    expect(await screen.findByText(formatMonthTitle(previousMonth))).toBeInTheDocument()
    expect(overviewMonths).toContain(shiftMonth(previousMonth, -1))
    expect(overviewMonths).toContain(previousMonth)
  })

  it('lets the manager retry when the indicators fail to load', async () => {
    mockOverviewApi()
    let attempts = 0
    server.use(
      http.get(`${organizationUrl}/overview`, ({ request }) => {
        if (new URL(request.url).searchParams.get('month') !== currentMonth) {
          return HttpResponse.json(createOverview())
        }
        attempts += 1
        return attempts === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json(createOverview())
      }),
    )
    const user = userEvent.setup()
    renderApp(<HomeRoute />)

    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('region', { name: 'Capacidade elétrica' }),
    ).toBeInTheDocument()
  })
})
