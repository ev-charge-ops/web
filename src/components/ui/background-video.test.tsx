import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BackgroundVideo } from './background-video'

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

describe('BackgroundVideo', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('plays a muted looping video with webm before mp4', () => {
    mockReducedMotion(false)
    const { container } = render(<BackgroundVideo src="/media/garage-loop" />)

    const video = container.querySelector('video')
    expect(video).not.toBeNull()
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('playsinline')
    expect(video).toHaveAttribute('preload', 'metadata')
    expect(video).toHaveAttribute('poster', '/media/garage-loop-poster.webp')
    expect(video?.muted).toBe(true)

    const sources = Array.from(container.querySelectorAll('source'))
    expect(sources.map((source) => source.getAttribute('type'))).toEqual([
      'video/webm',
      'video/mp4',
    ])
    expect(sources[0]).toHaveAttribute('src', '/media/garage-loop.webm')
    expect(sources[1]).toHaveAttribute('src', '/media/garage-loop.mp4')
  })

  it('shows only the poster when the user prefers reduced motion', () => {
    mockReducedMotion(true)
    const { container } = render(<BackgroundVideo src="/media/car-loop" />)

    expect(container.querySelector('video')).toBeNull()
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/media/car-loop-poster.webp',
    )
  })
})
