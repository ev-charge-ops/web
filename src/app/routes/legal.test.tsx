import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderApp } from '@/testing/test-utils'

import { PrivacyRoute } from './privacy'
import { TermsRoute } from './terms'

describe('legal routes', () => {
  it('renders the privacy policy with its table of contents and contact', () => {
    renderApp(<PrivacyRoute />, { route: '/privacidade' })

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Política de privacidade',
      }),
    ).toBeInTheDocument()
    const toc = screen.getByRole('navigation', { name: 'Sumário' })
    expect(
      within(toc).getByRole('link', { name: 'Seus direitos' }),
    ).toHaveAttribute('href', '#direitos')
    expect(
      screen.getByRole('heading', { level: 2, name: 'Seus direitos' }),
    ).toHaveAttribute('id', 'direitos')
    expect(
      screen.getByRole('link', { name: 'privacidade@evchargeops.com.br' }),
    ).toHaveAttribute('href', 'mailto:privacidade@evchargeops.com.br')
    expect(
      screen.getByRole('link', { name: 'Voltar ao portal' }),
    ).toHaveAttribute('href', '/')
  })

  it('switches between the legal documents', () => {
    renderApp(<TermsRoute />, { route: '/termos' })

    expect(
      screen.getByRole('heading', { level: 1, name: 'Termos de uso' }),
    ).toBeInTheDocument()
    const documents = screen.getByRole('navigation', {
      name: 'Documentos legais',
    })
    expect(
      within(documents).getByRole('link', { name: 'Termos de uso' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      within(documents).getByRole('link', { name: 'Política de privacidade' }),
    ).toHaveAttribute('href', '/privacidade')
  })
})
