import { useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from './use-prefers-reduced-motion'

type CountUpOptions = {
  durationMs?: number
  delayMs?: number
  from?: number
}

function easeOut(progress: number) {
  return 1 - Math.pow(1 - progress, 4)
}

export function useCountUp(
  target: number,
  { durationMs = 900, delayMs = 0, from = 0 }: CountUpOptions = {},
) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [value, setValue] = useState(prefersReducedMotion ? target : from)
  const currentRef = useRef(value)

  useEffect(() => {
    if (prefersReducedMotion) {
      currentRef.current = target
      return
    }
    const start = currentRef.current
    if (start === target) return
    let frame = 0
    let startedAt: number | null = null
    const tick = (now: number) => {
      startedAt ??= now + delayMs
      const elapsed = Math.max(0, now - startedAt)
      const progress = Math.min(1, elapsed / durationMs)
      const next = start + (target - start) * easeOut(progress)
      currentRef.current = next
      setValue(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, delayMs, prefersReducedMotion])

  return prefersReducedMotion ? target : value
}
