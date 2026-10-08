import { ChevronsUpDown } from 'lucide-react'

import { cn } from '@/utils/cn'

import { useCurrentOrganization } from '../hooks/use-current-organization'
import { organizationTypeLabels } from '../utils/labels'
import styles from './organization-switcher.module.css'

type OrganizationSwitcherProps = {
  chargePointCount?: number
}

function formatChargePointCount(count: number) {
  return count === 1 ? '1 ponto' : `${count} pontos`
}

export function OrganizationSwitcher({
  chargePointCount,
}: OrganizationSwitcherProps) {
  const { organization, managedOrganizations, selectOrganization } =
    useCurrentOrganization()

  if (!organization) return null

  const canSwitch = managedOrganizations.length > 1
  const subtitle = [
    organizationTypeLabels[organization.type],
    chargePointCount === undefined
      ? null
      : formatChargePointCount(chargePointCount),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={styles.group}>
      <span className={styles.eyebrow}>Condomínio</span>
      <div className={cn(styles.switcher, canSwitch && styles.interactive)}>
        <span className={styles.text}>
          <span className={styles.name} title={organization.name}>
            {organization.name}
          </span>
          <span className={styles.subtitle} title={subtitle}>
            {subtitle}
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
              aria-label="Trocar de condomínio"
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
    </div>
  )
}
