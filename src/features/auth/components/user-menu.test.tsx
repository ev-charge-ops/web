import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { managerUser } from '@/testing/mocks/auth'
import { renderApp } from '@/testing/test-utils'

import { UserMenu } from './user-menu'

describe('UserMenu', () => {
  it('shows who is signed in with a labelled logout button', () => {
    renderApp(<UserMenu user={managerUser} />)

    expect(screen.getByText(managerUser.name)).toBeInTheDocument()
    expect(screen.getByText(managerUser.email)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeEnabled()
  })
})
