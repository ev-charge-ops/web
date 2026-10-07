import { LogOut, Smartphone } from 'lucide-react'

import { AuthLayout } from '@/components/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/use-auth'

import { useLogout } from '../api/logout'
import styles from './driver-access-notice.module.css'

type DriverAccessNoticeProps = {
  user: AuthUser
}

export function DriverAccessNotice({ user }: DriverAccessNoticeProps) {
  const logout = useLogout()

  return (
    <AuthLayout
      title="Use o aplicativo EV ChargeOps"
      description="O portal web é exclusivo para gestores do condomínio. Para iniciar recargas e acompanhar seu consumo, use o aplicativo no seu celular."
    >
      <div className={styles.account}>
        <Smartphone size={18} strokeWidth={2} aria-hidden />
        <span>
          Conectado como <strong>{user.name}</strong> ({user.email})
        </span>
      </div>
      <Button
        variant="outline"
        icon={<LogOut size={16} strokeWidth={2} aria-hidden />}
        isLoading={logout.isPending}
        onClick={() => logout.mutate()}
      >
        Sair
      </Button>
    </AuthLayout>
  )
}
