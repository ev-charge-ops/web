import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Meter } from './meter'

describe('Meter', () => {
  it('exposes its value and fills proportionally', () => {
    render(<Meter label="Demanda" value={25.5} max={75} />)

    const meter = screen.getByRole('meter', { name: 'Demanda' })
    expect(meter).toHaveAttribute('aria-valuenow', '25.5')
    expect(meter.firstElementChild).toHaveStyle({ width: '34%' })
  })

  it('animates the fill only while live', () => {
    render(<Meter label="Energia" value={10} max={20} tone="energy" isLive />)

    expect(
      screen.getByRole('meter', { name: 'Energia' }).firstElementChild?.className,
    ).toMatch(/live/)
  })

  it('never overflows the track', () => {
    render(<Meter label="Demanda" value={90} max={75} tone="over" />)

    expect(
      screen.getByRole('meter', { name: 'Demanda' }).firstElementChild,
    ).toHaveStyle({ width: '100%' })
  })
})
