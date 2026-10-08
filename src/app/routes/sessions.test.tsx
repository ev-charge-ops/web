import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { managedOrganization } from '@/testing/mocks/organizations'
import { server } from '@/testing/mocks/server'
import {
  createSessionDetail,
  createSessionPage,
  flaggedSession,
  organizationSessions,
} from '@/testing/mocks/sessions'
import { renderApp } from '@/testing/test-utils'
import { formatMonth, getCurrentMonth, shiftMonth } from '@/utils/month'

import { SessionsRoute } from './sessions'

const sessionsUrl = `${env.apiUrl}/organizations/${managedOrganization.id}/sessions`

function mockSessions(items = organizationSessions) {
  const requests: URLSearchParams[] = []
  server.use(
    http.get(sessionsUrl, ({ request }) => {
      const params = new URL(request.url).searchParams
      requests.push(params)
      const status = params.get('status')
      const chargePointId = params.get('chargePointId')
      const anomaly = params.get('anomaly')
      return HttpResponse.json(
        createSessionPage(
          items.filter(
            (session) =>
              (!status || session.status === status) &&
              (!chargePointId || session.chargePoint.id === chargePointId) &&
              (!anomaly || Boolean(session.isAnomaly) === (anomaly === 'true')),
          ),
        ),
      )
    }),
  )
  return requests
}

describe('SessionsRoute', () => {
  it('lists the sessions of the current month with the anomaly badge', async () => {
    const requests = mockSessions()
    renderApp(<SessionsRoute />, { route: '/sessions' })

    const table = await screen.findByRole('table', { name: 'Sessões' })
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(4)
    expect(within(rows[1]).getByText('Marcelo Tavares')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Encerrada')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Anomalia · 0,91')).toBeInTheDocument()
    expect(within(rows[3]).getByText('Carregando')).toBeInTheDocument()
    expect(screen.getByText('3 · 1 sinalizada pela IA')).toBeInTheDocument()
    expect(requests[0].get('month')).toBe(getCurrentMonth())
  })

  it('filters by status, point and period', async () => {
    const requests = mockSessions()
    const user = userEvent.setup()
    renderApp(<SessionsRoute />, { route: '/sessions' })

    await screen.findByRole('table', { name: 'Sessões' })
    await user.selectOptions(screen.getByLabelText('Status'), 'CLOSED')
    expect(await screen.findByText('Verônica Alencar')).toBeInTheDocument()
    expect(screen.queryByText('Diego Lima')).not.toBeInTheDocument()
    expect(requests.at(-1)?.get('status')).toBe('CLOSED')

    await user.selectOptions(
      await screen.findByLabelText('Ponto'),
      'L1-02 · Garagem L1 · Vaga 13',
    )
    expect(await screen.findByText('1 · 1 sinalizada pela IA')).toBeInTheDocument()
    expect(screen.queryByText('Marcelo Tavares')).not.toBeInTheDocument()
    expect(screen.getByText('Verônica Alencar')).toBeInTheDocument()
    expect(requests.at(-1)?.get('chargePointId')).toBe(flaggedSession.chargePoint.id)
    expect(requests.at(-1)?.get('status')).toBe('CLOSED')
    expect(
      screen.queryByRole('option', { name: /Estacionamento público/ }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))
    const previousMonth = shiftMonth(getCurrentMonth(), -1)
    expect(
      await screen.findByText(`Sessões de ${formatMonth(previousMonth)}`),
    ).toBeInTheDocument()
    expect(requests.at(-1)?.get('month')).toBe(previousMonth)
  })

  it('keeps only the flagged sessions when asked', async () => {
    const requests = mockSessions()
    const user = userEvent.setup()
    renderApp(<SessionsRoute />, { route: '/sessions' })

    await screen.findByRole('table', { name: 'Sessões' })
    expect(requests[0].has('anomaly')).toBe(false)
    expect(requests[0].has('chargePointId')).toBe(false)

    await user.click(screen.getByRole('checkbox', { name: 'Somente anomalias' }))

    expect(await screen.findByText('1 · 1 sinalizada pela IA')).toBeInTheDocument()
    expect(screen.queryByText('Marcelo Tavares')).not.toBeInTheDocument()
    expect(screen.getByText('Verônica Alencar')).toBeInTheDocument()
    expect(requests.at(-1)?.get('anomaly')).toBe('true')
  })

  it('reads the point and anomaly filters from the URL', async () => {
    const requests = mockSessions()
    renderApp(<SessionsRoute />, {
      route: `/sessions?point=${flaggedSession.chargePoint.id}&anomaly=true`,
    })

    expect(await screen.findByText('Verônica Alencar')).toBeInTheDocument()
    expect(requests[0].get('chargePointId')).toBe(flaggedSession.chargePoint.id)
    expect(requests[0].get('anomaly')).toBe('true')
    expect(screen.getByRole('checkbox', { name: 'Somente anomalias' })).toBeChecked()
    await waitFor(() =>
      expect(screen.getByLabelText('Ponto')).toHaveValue(flaggedSession.chargePoint.id),
    )
  })

  it('explains a flagged session in the detail drawer', async () => {
    mockSessions()
    server.use(
      http.get(`${sessionsUrl}/${flaggedSession.id}`, () =>
        HttpResponse.json(createSessionDetail(flaggedSession)),
      ),
    )
    const user = userEvent.setup()
    renderApp(<SessionsRoute />, { route: '/sessions' })

    await user.click(
      await screen.findByRole('button', {
        name: /Ver detalhes da sessão de Verônica Alencar/,
      }),
    )

    const drawer = screen.getByRole('dialog', { name: 'Detalhes da sessão' })
    expect(
      await within(drawer).findByText('Sessão sinalizada · score 0,91'),
    ).toBeInTheDocument()
    expect(within(drawer).getByText('Ocupação após a recarga')).toBeInTheDocument()
    expect(within(drawer).getByText('2 h 11 min')).toBeInTheDocument()
    expect(within(drawer).getByText('Modelo de IA · v1')).toBeInTheDocument()

    await user.click(within(drawer).getAllByRole('button', { name: 'Fechar' })[0])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('loads the drawer from the organization session detail', async () => {
    mockSessions()
    const requested: string[] = []
    server.use(
      http.get(`${sessionsUrl}/:sessionId`, ({ params }) => {
        requested.push(String(params.sessionId))
        return HttpResponse.json(
          createSessionDetail(organizationSessions[2], {
            energyKwh: 4.5,
            driver: { id: organizationSessions[2].driver.id, name: 'Diego Lima Souza' },
          }),
        )
      }),
    )
    const user = userEvent.setup()
    renderApp(<SessionsRoute />, { route: '/sessions' })

    await user.click(
      await screen.findByRole('button', {
        name: /Ver detalhes da sessão de Diego Lima/,
      }),
    )

    const drawer = screen.getByRole('dialog', { name: 'Detalhes da sessão' })
    expect(await within(drawer).findByText('Diego Lima Souza')).toBeInTheDocument()
    expect(within(drawer).getByText('4,5 kWh')).toBeInTheDocument()
    expect(requested).toEqual([organizationSessions[2].id])
  })

  it('shows an error in the drawer when the detail fails to load', async () => {
    mockSessions()
    server.use(
      http.get(`${sessionsUrl}/${flaggedSession.id}`, () =>
        HttpResponse.json(
          {
            statusCode: 404,
            error: 'Not Found',
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND',
          },
          { status: 404 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderApp(<SessionsRoute />, { route: '/sessions' })

    await user.click(
      await screen.findByRole('button', {
        name: /Ver detalhes da sessão de Verônica Alencar/,
      }),
    )

    const drawer = screen.getByRole('dialog', { name: 'Detalhes da sessão' })
    expect(await within(drawer).findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os detalhes da sessão.',
    )
  })

  it('shows an empty state when the month has no sessions', async () => {
    mockSessions([])
    renderApp(<SessionsRoute />, { route: '/sessions' })

    expect(
      await screen.findByText(
        `Nenhuma sessão registrada em ${formatMonth(getCurrentMonth())}.`,
      ),
    ).toBeInTheDocument()
  })

  it('lets the manager retry when the sessions fail to load', async () => {
    let attempts = 0
    server.use(
        http.get(sessionsUrl, () => {
        attempts += 1
        return attempts === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json(createSessionPage())
      }),
    )
    const user = userEvent.setup()
    renderApp(<SessionsRoute />, { route: '/sessions' })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as sessões.',
    )
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('table', { name: 'Sessões' }),
    ).toBeInTheDocument()
  })
})
