import { Navigate } from 'react-router'

import { paths } from '@/config/paths'

export function AppleCallbackRoute() {
  return <Navigate to={paths.auth.login.getHref()} replace />
}
