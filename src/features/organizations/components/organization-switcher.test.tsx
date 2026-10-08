import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import {
  drivenOrganization,
  managedOrganization,
  secondManagedOrganization,
} from '@/testing/mocks/organizations'
import { server } from '@/testing/mocks/server'
import { renderApp } from '@/testing/test-utils'

import { selectedOrganizationStorageKey } from '../stores/selected-organization'
import { OrganizationSwitcher } from './organization-switcher'

function mockOrganizations(organizations: unknown[]) {
  server.use(
    http.get(`${env.apiUrl}/me/organizations`, () =>
      HttpResponse.json(organizations),
    ),
  )
}

describe('OrganizationSwitcher', () => {
  it('shows the first organization the user manages', async () => {
    mockOrganizations([drivenOrganization, managedOrganization])
    renderApp(<OrganizationSwitcher />)

    expect(await screen.findByText(managedOrganization.name)).toBeInTheDocument()
    expect(screen.getByText('RA')).toBeInTheDocument()
    expect(screen.getByText('Condomínio residencial')).toBeInTheDocument()
    expect(screen.queryByText(drivenOrganization.name)).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('renders nothing without a managed organization', async () => {
    mockOrganizations([drivenOrganization])
    renderApp(
      <div data-testid="slot">
        <OrganizationSwitcher />
      </div>,
    )

    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(screen.getByTestId('slot')).toBeEmptyDOMElement()
  })

  it('lets managers of several organizations pick and remember one', async () => {
    mockOrganizations([managedOrganization, secondManagedOrganization])
    const user = userEvent.setup()
    renderApp(<OrganizationSwitcher />)

    const select = await screen.findByRole('combobox', { name: 'Condomínio' })
    expect(select).toHaveValue(managedOrganization.id)

    await user.selectOptions(select, secondManagedOrganization.name)

    expect(select).toHaveValue(secondManagedOrganization.id)
    expect(localStorage.getItem(selectedOrganizationStorageKey)).toBe(
      secondManagedOrganization.id,
    )
  })

  it('restores the remembered organization', async () => {
    localStorage.setItem(
      selectedOrganizationStorageKey,
      secondManagedOrganization.id,
    )
    mockOrganizations([managedOrganization, secondManagedOrganization])
    renderApp(<OrganizationSwitcher />)

    expect(
      await screen.findByRole('combobox', { name: 'Condomínio' }),
    ).toHaveValue(secondManagedOrganization.id)
  })
})
