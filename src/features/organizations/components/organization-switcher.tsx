import { ChevronsUpDown } from 'lucide-react'

import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/initials'

import { useCurrentOrganization } from '../hooks/use-current-organization'
import { organizationTypeLabels } from '../utils/labels'
import styles from './organization-switcher.module.css'

export function OrganizationSwitcher() {
  const { organization, managedOrganizations, selectOrganization } =
    useCurrentOrganization()

  if (!organization) return null

  const canSwitch = managedOrganizations.length > 1

  return (
    <div className={cn(styles.switcher, canSwitch && styles.interactive)}>
      <span className={styles.initials} aria-hidden="true">
        {getInitials(organization.name)}
      </span>
      <span className={styles.text}>
        <span className={styles.name} title={organization.name}>
          {organization.name}
        </span>
        <span className={styles.subtitle}>
          {organizationTypeLabels[organization.type]}
        </span>
      </span>
      {canSwitch ? (
        <>
          <ChevronsUpDown
            size={16}
            strokeWidth={2}
            aria-hidden
            className={styles.chevrons}
          />
          <select
            aria-label="Condomínio"
            className={styles.select}
            value={organization.id}
            onChange={(event) => selectOrganization(event.target.value)}
          >
            {managedOrganizations.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </>
      ) : null}
    </div>
  )
}
