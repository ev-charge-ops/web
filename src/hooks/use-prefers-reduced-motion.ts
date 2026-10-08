import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

function getMediaQuery() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null
  }
  return window.matchMedia(query)
}

function subscribe(onChange: () => void) {
  const mediaQuery = getMediaQuery()
  mediaQuery?.addEventListener('change', onChange)
  return () => mediaQuery?.removeEventListener('change', onChange)
}

function getSnapshot() {
  return getMediaQuery()?.matches ?? false
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
