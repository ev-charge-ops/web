import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet, useLocation } from 'react-router'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { FullPageSpinner } from '@/components/layouts/full-page-spinner'
import { paths } from '@/config/paths'
import { DriverAccessNotice } from '@/features/auth/components/driver-access-notice'
import { EmailVerificationBanner } from '@/features/auth/components/email-verification-banner'
import { UserMenu } from '@/features/auth/components/user-menu'
import { getChargePointsQueryOptions } from '@/features/charge-points/api/get-charge-points'
import { OrganizationSwitcher } from '@/features/organizations/components/organization-switcher'
import { useCurrentOrganization } from '@/features/organizations/hooks/use-current-organization'
import { useAuth } from '@/lib/use-auth'

function SidebarOrganization() {
  const { organization } = useCurrentOrganization()
  const chargePoints = useQuery({
    ...getChargePointsQueryOptions(organization?.id ?? ''),
    enabled: Boolean(organization),
  })

  return <OrganizationSwitcher chargePointCount={chargePoints.data?.length} />
}

export function ProtectedRoot() {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageSpinner label="Restaurando sessão" />
  }

  if (!user) {
    return (
      <Navigate
        to={paths.auth.login.getHref(location.pathname + location.search)}
        replace
      />
    )
  }

  if (user.role !== 'MANAGER') {
    return <DriverAccessNotice user={user} />
  }

  return (
    <DashboardLayout
      user={<UserMenu user={user} />}
      organization={<SidebarOrganization />}
    >
      <EmailVerificationBanner user={user} />
      <Outlet />
    </DashboardLayout>
  )
}
