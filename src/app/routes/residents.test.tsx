import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import {
  createInviteResponse,
  invites,
  members,
} from '@/testing/mocks/invites'
import {
  drivenOrganization,
  managedOrganization,
} from '@/testing/mocks/organizations'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { ResidentsRoute } from './residents'

const organizationUrl = `${env.apiUrl}/organizations/${managedOrganization.id}`

function mockResidents(inviteList = invites) {
  let currentInvites = [...inviteList]
  server.use(
    http.get(`${organizationUrl}/members`, () => HttpResponse.json(members)),
    http.get(`${organizationUrl}/invites`, () =>
      HttpResponse.json(currentInvites),
    ),
  )
  return {
    setInvites: (next: typeof invites) => {
      currentInvites = next
    },
  }
}

describe('ResidentsRoute', () => {
  it('lists members and invites of the managed organization', async () => {
    mockResidents()
    renderApp(<ResidentsRoute />, { route: '/residents' })

    const membersTable = await screen.findByRole('table', { name: 'Moradores' })
    expect(within(membersTable).getByText('Diego Lima')).toBeInTheDocument()
    expect(within(membersTable).getByText('A · 12')).toBeInTheDocument()
    expect(within(membersTable).getByText('Morador')).toBeInTheDocument()
    expect(within(membersTable).getByText('Gestor')).toBeInTheDocument()
    expect(within(membersTable).getByText('20/09/2026')).toBeInTheDocument()

    const invitesTable = await screen.findByRole('table', { name: 'Convites' })
    const rows = within(invitesTable).getAllByRole('row')
    expect(within(rows[1]).getByText('ana@example.com')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Pendente')).toBeInTheDocument()
    expect(within(rows[1]).getByText('07/10/2026')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Expirado')).toBeInTheDocument()
    expect(within(rows[3]).getByText('Aceito')).toBeInTheDocument()
    expect(
      within(rows[3]).queryByRole('button', { name: /Reenviar/ }),
    ).not.toBeInTheDocument()
  })

  it('invites a resident and refreshes the list', async () => {
    const residents = mockResidents([])
    let body: unknown
    server.use(
      http.post(`${organizationUrl}/invites`, async ({ request }) => {
        body = await request.json()
        const invite = createInviteResponse()
        residents.setInvites([invite])
        return HttpResponse.json(invite, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderApp(<ResidentsRoute />, { route: '/residents' })

    expect(
      await screen.findByText('Nenhum convite enviado ainda.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Convidar morador' }))
    const drawer = screen.getByRole('dialog', { name: 'Convidar morador' })
    await user.click(
      within(drawer).getByRole('button', { name: 'Enviar convite' }),
    )
    expect(
      within(drawer).getByText('Informe um e-mail válido'),
    ).toBeInTheDocument()
    expect(within(drawer).getByText('Informe a unidade')).toBeInTheDocument()

    await user.type(
      within(drawer).getByLabelText('E-mail do morador'),
      'ana@example.com',
    )
    await user.type(within(drawer).getByLabelText('Unidade'), 'B · 42')
    await user.click(
      within(drawer).getByRole('button', { name: 'Enviar convite' }),
    )

    expect(
      await screen.findByText('Convite enviado para ana@example.com'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(body).toEqual({ email: 'ana@example.com', unitLabel: 'B · 42' })
    expect(
      await screen.findByRole('table', { name: 'Convites' }),
    ).toHaveTextContent('ana@example.com')
  })

  it('explains when the email already has a pending invite', async () => {
    mockResidents([])
    server.use(
      http.post(`${organizationUrl}/invites`, () =>
        HttpResponse.json(
          { statusCode: 409, code: 'INVITE_ALREADY_PENDING' },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderApp(<ResidentsRoute />, { route: '/residents' })

    await user.click(
      await screen.findByRole('button', { name: 'Convidar morador' }),
    )
    const drawer = screen.getByRole('dialog', { name: 'Convidar morador' })
    await user.type(
      within(drawer).getByLabelText('E-mail do morador'),
      'ana@example.com',
    )
    await user.type(within(drawer).getByLabelText('Unidade'), 'B · 42')
    await user.click(
      within(drawer).getByRole('button', { name: 'Enviar convite' }),
    )

    expect(await within(drawer).findByRole('alert')).toHaveTextContent(
      'Já existe um convite pendente para este e-mail.',
    )
  })

  it('resends an invite after confirmation', async () => {
    mockResidents()
    let resent = false
    server.use(
      http.post(`${organizationUrl}/invites/${invites[1].id}/resend`, () => {
        resent = true
        return HttpResponse.json(
          createInviteResponse({ ...invites[1], status: 'PENDING' }),
        )
      }),
    )
    const user = userEvent.setup()
    renderApp(<ResidentsRoute />, { route: '/residents' })

    await user.click(
      await screen.findByRole('button', {
        name: 'Reenviar convite para bruno@example.com',
      }),
    )
    const dialog = screen.getByRole('alertdialog', { name: 'Reenviar convite?' })
    await user.click(within(dialog).getByRole('button', { name: 'Reenviar' }))

    expect(
      await screen.findByText('Convite reenviado para bruno@example.com'),
    ).toBeInTheDocument()
    expect(resent).toBe(true)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('revokes an invite only after confirmation', async () => {
    const residents = mockResidents()
    let revoked = false
    server.use(
      http.delete(`${organizationUrl}/invites/${invites[0].id}`, () => {
        revoked = true
        residents.setInvites(invites.slice(1))
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderApp(<ResidentsRoute />, { route: '/residents' })

    const revokeButton = await screen.findByRole('button', {
      name: 'Revogar convite para ana@example.com',
    })
    await user.click(revokeButton)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(revoked).toBe(false)

    await user.click(revokeButton)
    const dialog = screen.getByRole('alertdialog', { name: 'Revogar convite?' })
    await user.click(within(dialog).getByRole('button', { name: 'Revogar' }))

    expect(
      await screen.findByText('Convite para ana@example.com revogado'),
    ).toBeInTheDocument()
    expect(revoked).toBe(true)
    expect(
      await screen.findByRole('table', { name: 'Convites' }),
    ).not.toHaveTextContent('ana@example.com')
  })

  it('shows a toast when the invite can no longer be changed', async () => {
    mockResidents()
    server.use(
      http.delete(
        `${organizationUrl}/invites/${invites[0].id}`,
        () => new HttpResponse(null, { status: 409 }),
      ),
    )
    const user = userEvent.setup()
    renderApp(<ResidentsRoute />, { route: '/residents' })

    await user.click(
      await screen.findByRole('button', {
        name: 'Revogar convite para ana@example.com',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Revogar' }))

    expect(
      await screen.findByText(
        'Este convite não pode mais ser alterado. A lista foi atualizada.',
      ),
    ).toBeInTheDocument()
  })

  it('explains when the account does not manage an organization', async () => {
    server.use(
      http.get(`${env.apiUrl}/me/organizations`, () =>
        HttpResponse.json([drivenOrganization]),
      ),
    )
    renderApp(<ResidentsRoute />, { route: '/residents' })

    expect(
      await screen.findByText(
        'Sua conta ainda não administra nenhum condomínio.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Convidar morador' }),
    ).not.toBeInTheDocument()
  })
})
