import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/use-auth'

import { useLogout } from '../api/logout'
import styles from './user-menu.module.css'

type UserMenuProps = {
  user: AuthUser
}

export function UserMenu({ user }: UserMenuProps) {
  const logout = useLogout()

  return (
    <div className={styles.menu}>
      <span className={styles.name} title={user.email}>
        {user.name}
      </span>
      <Button
        variant="secondary"
        size="sm"
        icon={<LogOut size={15} strokeWidth={2} aria-hidden />}
        isLoading={logout.isPending}
        onClick={() => logout.mutate()}
      >
        Sair
      </Button>
    </div>
  )
}
