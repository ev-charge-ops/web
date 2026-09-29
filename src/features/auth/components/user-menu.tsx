import { LogOut } from 'lucide-react'

import { Spinner } from '@/components/ui/spinner'
import type { AuthUser } from '@/lib/use-auth'
import { getInitials } from '@/utils/initials'

import { useLogout } from '../api/logout'
import styles from './user-menu.module.css'

type UserMenuProps = {
  user: AuthUser
}

export function UserMenu({ user }: UserMenuProps) {
  const logout = useLogout()

  return (
    <div className={styles.menu}>
      <span className={styles.avatar} aria-hidden="true">
        {getInitials(user.name)}
      </span>
      <span className={styles.text}>
        <span className={styles.name} title={user.name}>
          {user.name}
        </span>
        <span className={styles.email} title={user.email}>
          {user.email}
        </span>
      </span>
      <button
        type="button"
        className={styles.logout}
        aria-label="Sair"
        title="Sair"
        disabled={logout.isPending}
        aria-busy={logout.isPending || undefined}
        onClick={() => logout.mutate()}
      >
        {logout.isPending ? (
          <Spinner size="sm" />
        ) : (
          <LogOut size={18} strokeWidth={2} aria-hidden />
        )}
      </button>
    </div>
  )
}
