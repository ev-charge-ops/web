import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AnimatedNumber } from '@/components/ui/animated-number'

const format = (value: number) => value.toFixed(0)

describe('AnimatedNumber', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('counts up to the value when motion is allowed', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    render(<AnimatedNumber value={120} format={format} durationMs={400} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(200)
    })
    const halfway = Number(screen.getByText(/^\d+$/).textContent)
    expect(halfway).toBeGreaterThan(0)
    expect(halfway).toBeLessThan(120)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByText('120')).toBeInTheDocument()
  })

  it('shows the final value right away with reduced motion', () => {
    render(<AnimatedNumber value={120} format={format} />)

    expect(screen.getByText('120')).toBeInTheDocument()
  })
})
