import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StatusPill } from './status-pill'

describe('StatusPill', () => {
  it('renders its label with the info tone by default', () => {
    render(<StatusPill>Pendente</StatusPill>)

    expect(screen.getByText('Pendente')).toHaveAttribute('data-tone', 'info')
  })

  it.each(['charging', 'idle', 'fault', 'offline'] as const)(
    'applies the %s tone',
    (tone) => {
      render(<StatusPill tone={tone}>Status</StatusPill>)

      const pill = screen.getByText('Status')
      expect(pill).toHaveAttribute('data-tone', tone)
      expect(pill.className).toMatch(new RegExp(tone))
    },
  )

  it('renders a decorative dot when requested', () => {
    const { container } = render(
      <StatusPill tone="charging" withDot>
        Carregando
      </StatusPill>,
    )

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })
})
