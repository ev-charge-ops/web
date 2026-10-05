import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderApp } from '@/testing/test-utils'

import { NotFoundRoute } from './not-found'

describe('NotFoundRoute', () => {
  it('explains the missing page and links back to the overview', () => {
    renderApp(<NotFoundRoute />, { route: '/missing' })

    expect(
      screen.getByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Erro 404' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ir para a visão geral' }),
    ).toHaveAttribute('href', '/')
    expect(
      screen.getByRole('button', { name: 'Voltar à página anterior' }),
    ).toBeInTheDocument()
    expect(screen.getByText('404 · NOT_FOUND')).toBeInTheDocument()
  })
})
