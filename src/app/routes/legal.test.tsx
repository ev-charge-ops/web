import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderApp } from '@/testing/test-utils'

import { PrivacyRoute } from './privacy'
import { TermsRoute } from './terms'

describe('legal routes', () => {
  it('renders the privacy policy with the contact address', () => {
    renderApp(<PrivacyRoute />, { route: '/privacidade' })

    expect(
      screen.getByRole('heading', { name: 'Política de Privacidade' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'privacidade@evchargeops.com.br' }),
    ).toHaveAttribute('href', 'mailto:privacidade@evchargeops.com.br')
  })

  it('renders the terms of use linking to the privacy policy', () => {
    renderApp(<TermsRoute />, { route: '/termos' })

    expect(
      screen.getByRole('heading', { level: 1, name: 'Termos de Uso' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Política de Privacidade' })[0],
    ).toHaveAttribute('href', '/privacidade')
  })
})
