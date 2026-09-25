import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { managedOrganization } from '@/testing/mocks/organizations'
import { server } from '@/testing/mocks/server'
import { createStatement } from '@/testing/mocks/statements'
import { renderApp } from '@/testing/test-utils'
import { formatMonth, getCurrentMonth, shiftMonth } from '@/utils/month'

import { CostSharingRoute } from './cost-sharing'

const statementsUrl = `${env.apiUrl}/organizations/${managedOrganization.id}/statements`
const csv = 'unidade;kwh;energia;acesso;ocupacao;total\nB · 23;38,33;34,12;35,00;2,00;71,12'

function mockStatements(statement = createStatement()) {
  const months: (string | null)[] = []
  server.use(
    http.get(statementsUrl, ({ request }) => {
      months.push(new URL(request.url).searchParams.get('month'))
      return HttpResponse.json(statement)
    }),
  )
  return months
}

describe('CostSharingRoute', () => {
  const createObjectURL = vi.fn((_blob: Blob) => 'blob:statement')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    Object.assign(URL, { createObjectURL, revokeObjectURL })
  })

  afterEach(() => {
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
  })

  it('shows the statement of the current month sorted by total', async () => {
    const months = mockStatements()
    renderApp(<CostSharingRoute />, { route: '/cost-sharing' })

    const table = await screen.findByRole('table', { name: 'Rateio por unidade' })
    const rows = within(table).getAllByRole('row')
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('B · 23')
    expect(within(rows[2]).getByRole('rowheader')).toHaveTextContent('A · 12')
    expect(within(rows[3]).getByRole('rowheader')).toHaveTextContent('A · 11')
    expect(rows[1]).toHaveTextContent(/R\$\s2,00/)
    expect(rows[1]).toHaveTextContent(/R\$\s71,12/)
    expect(rows[4]).toHaveTextContent('Total a ratear')
    expect(rows[4]).toHaveTextContent(/R\$\s152,26/)
    expect(
      screen.getByRole('heading', {
        name: `Rateio de ${formatMonth(getCurrentMonth())}`,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Mês em aberto')).toBeInTheDocument()
    expect(screen.getByText('3 unidades no rateio')).toBeInTheDocument()
    expect(months[0]).toBe(getCurrentMonth())
  })

  it('loads the statement of the chosen month', async () => {
    const months = mockStatements()
    const user = userEvent.setup()
    renderApp(<CostSharingRoute />, { route: '/cost-sharing' })

    await screen.findByRole('table', { name: 'Rateio por unidade' })
    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))

    const previousMonth = shiftMonth(getCurrentMonth(), -1)
    expect(
      await screen.findByRole('heading', {
        name: `Rateio de ${formatMonth(previousMonth)}`,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Mês encerrado')).toBeInTheDocument()
    expect(months.at(-1)).toBe(previousMonth)
  })

  it('downloads the CSV of the month as a file', async () => {
    mockStatements()
    let exportedMonth: string | null = null
    server.use(
      http.get(`${statementsUrl}/export.csv`, ({ request }) => {
        exportedMonth = new URL(request.url).searchParams.get('month')
        return new HttpResponse(csv, {
          headers: { 'Content-Type': 'text/csv; charset=utf-8' },
        })
      }),
    )
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    const user = userEvent.setup()
    renderApp(<CostSharingRoute />, { route: '/cost-sharing' })

    await screen.findByRole('table', { name: 'Rateio por unidade' })
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))

    const month = getCurrentMonth()
    expect(
      await screen.findByText(`CSV do rateio de ${formatMonth(month)} baixado.`),
    ).toBeInTheDocument()
    expect(exportedMonth).toBe(month)
    expect(click).toHaveBeenCalledOnce()
    const link = click.mock.contexts[0] as HTMLAnchorElement
    expect(link.download).toBe(`rateio-${month}.csv`)
    expect(link.href).toBe('blob:statement')
    const blob = createObjectURL.mock.calls[0][0]
    expect(await blob.text()).toBe(csv)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:statement')
  })

  it('names the downloaded file after the server filename', async () => {
    mockStatements()
    server.use(
      http.get(
        `${statementsUrl}/export.csv`,
        () =>
          new HttpResponse(csv, {
            headers: {
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition':
                'attachment; filename="rateio-residencial-aurora-2026-10.csv"',
            },
          }),
      ),
    )
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    const user = userEvent.setup()
    renderApp(<CostSharingRoute />, { route: '/cost-sharing' })

    await screen.findByRole('table', { name: 'Rateio por unidade' })
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))

    await waitFor(() => expect(click).toHaveBeenCalledOnce())
    const link = click.mock.contexts[0] as HTMLAnchorElement
    expect(link.download).toBe('rateio-residencial-aurora-2026-10.csv')
  })

  it('shows an error toast when the export fails', async () => {
    mockStatements()
    server.use(
      http.get(
        `${statementsUrl}/export.csv`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    const user = userEvent.setup()
    renderApp(<CostSharingRoute />, { route: '/cost-sharing' })

    await screen.findByRole('table', { name: 'Rateio por unidade' })
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))

    expect(
      await screen.findByText('Não foi possível exportar o CSV. Tente novamente.'),
    ).toBeInTheDocument()
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('shows an empty state and disables the export without units', async () => {
    mockStatements(
      createStatement({
        lines: [],
        totals: {
          sessionsCount: 0,
          energyKwh: 0,
          energyCents: 0,
          accessFeeCents: 0,
          idleFeeCents: 0,
          totalCents: 0,
          unitsCount: 0,
        },
      }),
    )
    renderApp(<CostSharingRoute />, { route: '/cost-sharing' })

    expect(
      await screen.findByText(
        `Nenhuma unidade no rateio de ${formatMonth(getCurrentMonth())}.`,
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled()
  })

  it('lets the manager retry when the statement fails to load', async () => {
    let attempts = 0
    server.use(
      http.get(statementsUrl, () => {
        attempts += 1
        return attempts === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json(createStatement())
      }),
    )
    const user = userEvent.setup()
    renderApp(<CostSharingRoute />, { route: '/cost-sharing' })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o rateio do mês.',
    )
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('table', { name: 'Rateio por unidade' }),
    ).toBeInTheDocument()
  })
})
