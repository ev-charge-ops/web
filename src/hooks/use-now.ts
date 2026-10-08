import { useEffect, useState } from 'react'

export function useNow(intervalMs = 1000, isEnabled = true) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!isEnabled) return
    const interval = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(interval)
  }, [intervalMs, isEnabled])

  return now
}
