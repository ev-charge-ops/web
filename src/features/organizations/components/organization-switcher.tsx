import { Building2 } from 'lucide-react'

import { useCurrentOrganization } from '../hooks/use-current-organization'
import styles from './organization-switcher.module.css'

export function OrganizationSwitcher() {
  const { organization, managedOrganizations, selectOrganization } =
    useCurrentOrganization()

  if (!organization) return null

  return (
    <div className={styles.switcher}>
      <Building2 size={16} strokeWidth={2} aria-hidden className={styles.icon} />
      {managedOrganizations.length > 1 ? (
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
      ) : (
        <span className={styles.name} title={organization.name}>
          {organization.name}
        </span>
      )}
    </div>
  )
}
