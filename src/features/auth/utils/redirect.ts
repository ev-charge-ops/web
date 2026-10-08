import { paths } from '@/config/paths'

export function getSafeRedirect(redirectTo: string | null) {
  if (redirectTo?.startsWith('/') && !redirectTo.startsWith('//')) {
    return redirectTo
  }
  return paths.home.getHref()
}
