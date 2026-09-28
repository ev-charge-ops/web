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

  it('always pairs the text with a decorative dot', () => {
    const { container } = render(<StatusPill tone="idle">Tolerância</StatusPill>)

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.getByText('Tolerância')).not.toHaveAttribute('data-live')
  })

  it('pulses the dot while live', () => {
    render(
      <StatusPill tone="charging" isLive>
        Carregando
      </StatusPill>,
    )

    const pill = screen.getByText('Carregando')
    expect(pill).toHaveAttribute('data-live', 'true')
    expect(pill.className).toMatch(/live/)
  })
})
