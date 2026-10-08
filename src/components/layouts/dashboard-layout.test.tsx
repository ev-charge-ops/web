import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { DashboardLayout } from './dashboard-layout'

function renderLayout(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <DashboardLayout
        organization={<span>Residencial Aclimação</span>}
        user={<button type="button">Sair</button>}
      >
        <h1>Conteúdo</h1>
      </DashboardLayout>
    </MemoryRouter>,
  )
}

describe('DashboardLayout', () => {
  it('lists the portal sections in the main navigation', () => {
    renderLayout()

    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual([
      'Visão geral',
      'Sessões',
      'Rateio mensal',
      'Pontos e capacidade',
      'Regras de tarifa',
      'Moradores',
    ])
  })

  it('marks the current section', () => {
    renderLayout('/cost-sharing')

    expect(screen.getByRole('link', { name: 'Rateio mensal' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('renders the organization, the user menu and the page inside the main landmark', () => {
    renderLayout()

    const sidebar = screen.getByRole('complementary', { name: 'Menu do portal' })
    expect(within(sidebar).getByText('Residencial Aclimação')).toBeInTheDocument()
    expect(within(sidebar).getByRole('button', { name: 'Sair' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('main')).getByRole('heading', { name: 'Conteúdo' }),
    ).toBeInTheDocument()
  })

  it('opens the menu drawer, moves focus into it and closes on Escape', async () => {
    const user = userEvent.setup()
    renderLayout()

    const openButton = screen.getByRole('button', { name: 'Abrir menu' })
    expect(openButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(openButton)

    expect(openButton).toHaveAttribute('aria-expanded', 'true')
    expect(document.body.style.overflow).toBe('hidden')
    const closeButtons = screen.getAllByRole('button', { name: 'Fechar menu' })
    expect(closeButtons.at(-1)).toHaveFocus()

    await user.keyboard('{Escape}')

    expect(openButton).toHaveAttribute('aria-expanded', 'false')
    expect(openButton).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })

  it('closes the menu drawer after navigating', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await user.click(screen.getByRole('link', { name: 'Sessões' }))

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('link', { name: 'Sessões' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})
