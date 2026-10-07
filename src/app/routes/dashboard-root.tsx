import { Outlet } from 'react-router'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export function DashboardRoot() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
