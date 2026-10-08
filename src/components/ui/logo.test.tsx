import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Logo } from './logo'

describe('Logo', () => {
  it('exposes the brand name as a single image with the wordmark', () => {
    render(<Logo />)

    const logo = screen.getByRole('img', { name: 'EV ChargeOps' })
    expect(logo).toHaveAttribute('data-variant', 'dark')
    expect(logo).toHaveTextContent('EV ChargeOps')
  })

  it('renders only the mark when the wordmark is hidden', () => {
    render(<Logo variant="light" hasWordmark={false} />)

    const logo = screen.getByRole('img', { name: 'EV ChargeOps' })
    expect(logo).toHaveAttribute('data-variant', 'light')
    expect(logo).not.toHaveTextContent('EV ChargeOps')
    expect(logo.querySelector('circle')).toBeInTheDocument()
  })

  it('drops the charge node on compact marks', () => {
    render(<Logo size={24} />)

    expect(
      screen.getByRole('img', { name: 'EV ChargeOps' }).querySelector('circle'),
    ).not.toBeInTheDocument()
  })
})
