import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderApp } from '@/testing/test-utils'

import { PrivacyRoute } from './privacy'
import { SupportRoute } from './support'
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
      screen.getByRole('link', { name: 'contato@softmoon.io' }),
    ).toHaveAttribute('href', 'mailto:contato@softmoon.io')
    expect(
      screen.getByText(/A controladora dos dados é SOFTMOON\.IO/),
    ).toHaveTextContent('29.734.824/0001-77')
    expect(
      screen.getByText(
        'SOFTMOON.IO SERVICOS DE INFORMATICA LTDA · CNPJ 29.734.824/0001-77',
      ),
    ).toBeInTheDocument()
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
    expect(
      within(documents).getByRole('link', { name: 'Suporte' }),
    ).toHaveAttribute('href', '/suporte')
  })

  it('covers payments, location, account deletion and data sources in the privacy policy', () => {
    renderApp(<PrivacyRoute />, { route: '/privacidade' })

    expect(
      screen.getByRole('heading', { level: 2, name: 'Exclusão da conta' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Notificações' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Localização precisa:/)).toBeInTheDocument()
    expect(screen.getAllByText(/Stripe/).length).toBeGreaterThan(0)
    expect(
      screen.getByRole('link', { name: 'Open Charge Map' }),
    ).toHaveAttribute('href', 'https://openchargemap.org')
  })

  it('renders the support page with the contact email and the FAQ', () => {
    renderApp(<SupportRoute />, { route: '/suporte' })

    expect(
      screen.getByRole('heading', { level: 1, name: 'Suporte' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'contato@softmoon.io' })[0],
    ).toHaveAttribute('href', 'mailto:contato@softmoon.io')
    for (const question of [
      'Como inicio uma recarga?',
      'Como funcionam os pagamentos e reembolsos?',
      'Como excluo minha conta?',
      'Como meus dados são tratados?',
      'Os carregadores são reais?',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: question }),
      ).toBeInTheDocument()
    }
    expect(
      screen.getByText(/Conta → Privacidade e dados → Excluir conta/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Versão de/)).not.toBeInTheDocument()
  })
})
