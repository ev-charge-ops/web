import { useSearchParams } from 'react-router'

import { Logo } from '@/components/ui/logo'
import { env } from '@/config/env'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'
import { AppDownload } from '@/features/invites/components/app-download'
import { InviteAcceptance } from '@/features/invites/components/invite-acceptance'
import { InviteMessage } from '@/features/invites/components/invite-message'

import styles from './invite.module.css'

export function InviteRoute() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <Logo size={52} isAnimated className={styles.logo} />
        {token ? (
          <InviteAcceptance
            token={token}
            oauthButtons={
              env.googleClientId || env.appleServicesId ? (
                <OAuthButtons />
              ) : undefined
            }
          />
        ) : (
          <InviteMessage
            title="Link de convite inválido"
            description="Abra o link completo enviado por e-mail."
          />
        )}
      </main>
      <AppDownload />
    </div>
  )
}
