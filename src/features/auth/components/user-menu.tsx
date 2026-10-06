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
      <div className={styles.profile}>
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
      </div>
      <button
        type="button"
        className={styles.logout}
        disabled={logout.isPending}
        aria-busy={logout.isPending || undefined}
        onClick={() => logout.mutate()}
      >
        <span className={styles.icon}>
          {logout.isPending ? (
            <Spinner size="sm" label="Saindo" />
          ) : (
            <LogOut size={20} strokeWidth={2} aria-hidden />
          )}
        </span>
        Sair
      </button>
    </div>
  )
}
