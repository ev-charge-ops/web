import { Navigate, Outlet, useLocation } from 'react-router'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { FullPageSpinner } from '@/components/layouts/full-page-spinner'
import { paths } from '@/config/paths'
import { DriverAccessNotice } from '@/features/auth/components/driver-access-notice'
import { EmailVerificationBanner } from '@/features/auth/components/email-verification-banner'
import { UserMenu } from '@/features/auth/components/user-menu'
import { OrganizationSwitcher } from '@/features/organizations/components/organization-switcher'
import { useAuth } from '@/lib/use-auth'

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
      organization={<OrganizationSwitcher />}
    >
      <EmailVerificationBanner user={user} />
      <Outlet />
    </DashboardLayout>
  )
}
