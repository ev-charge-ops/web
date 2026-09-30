import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MonthPicker } from './month-picker'

describe('MonthPicker', () => {
  it('shows the month and moves backwards and forwards', async () => {
    const onChange = vi.fn()
    render(<MonthPicker value="2026-01" onChange={onChange} />)

    expect(screen.getByText('janeiro de 2026')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }))
    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }))

    expect(onChange.mock.calls).toEqual([['2025-12'], ['2026-02']])
  })

  it('keeps the group labelled when the label is visually hidden', () => {
    render(
      <MonthPicker
        label="Mês do rateio"
        value="2026-09"
        isLabelHidden
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('group', { name: 'Mês do rateio' })).toBeInTheDocument()
    expect(screen.getByText('Mês do rateio')).toHaveClass('sr-only')
  })

  it('does not go past the maximum month', () => {
    render(<MonthPicker value="2026-10" max="2026-10" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled()
  })

  it('renders a compact pill with the short month and the full name for screen readers', () => {
    render(
      <MonthPicker
        label="Mês"
        value="2026-09"
        isLabelHidden
        isCompact
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Set 2026')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('setembro de 2026')).toHaveClass('sr-only')
  })
})
