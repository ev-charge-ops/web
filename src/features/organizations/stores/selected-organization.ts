import { useSyncExternalStore } from 'react'

export const selectedOrganizationStorageKey = 'ev-charge-ops:organization-id'

const listeners = new Set<() => void>()

function readSelectedOrganizationId() {
  try {
    return localStorage.getItem(selectedOrganizationStorageKey)
  } catch {
    return null
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setSelectedOrganizationId(id: string) {
  try {
    localStorage.setItem(selectedOrganizationStorageKey, id)
  } catch {
    return
  }
  listeners.forEach((listener) => listener())
}

export function useSelectedOrganizationId() {
  return useSyncExternalStore(subscribe, readSelectedOrganizationId)
}
