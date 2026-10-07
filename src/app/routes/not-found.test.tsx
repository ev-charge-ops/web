import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderApp } from '@/testing/test-utils'

import { NotFoundRoute } from './not-found'

describe('NotFoundRoute', () => {
  it('renders a link back to the home page', () => {
    renderApp(<NotFoundRoute />, { route: '/missing' })

    expect(
      screen.getByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
