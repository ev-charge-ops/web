import { useCallback, useEffect, useState } from 'react'

export function useCooldown(durationSeconds: number) {
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (endsAt === null) return
    const interval = setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= endsAt) setEndsAt(null)
    }, 250)
    return () => clearInterval(interval)
  }, [endsAt])

  const start = useCallback(() => {
    const current = Date.now()
    setNow(current)
    setEndsAt(current + durationSeconds * 1000)
  }, [durationSeconds])

  const secondsLeft =
    endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000))

  return { secondsLeft, isCoolingDown: secondsLeft > 0, start }
}
