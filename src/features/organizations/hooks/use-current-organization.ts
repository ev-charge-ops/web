import { useMemo } from 'react'

import { useMyOrganizations } from '../api/get-my-organizations'
import {
  setSelectedOrganizationId,
  useSelectedOrganizationId,
} from '../stores/selected-organization'

export function useCurrentOrganization() {
  const query = useMyOrganizations()
  const selectedId = useSelectedOrganizationId()

  const managedOrganizations = useMemo(
    () => (query.data ?? []).filter(({ role }) => role === 'MANAGER'),
    [query.data],
  )

  const organization =
    managedOrganizations.find(({ id }) => id === selectedId) ??
    managedOrganizations[0] ??
    null

  return {
    organization,
    managedOrganizations,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
    selectOrganization: setSelectedOrganizationId,
  }
}
