import { useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/layouts/auth-layout'
import { Alert } from '@/components/ui/alert'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'
import { InviteAcceptance } from '@/features/invites/components/invite-acceptance'

export function InviteRoute() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <AuthLayout
      title="Convite para o EV ChargeOps"
      description="Aceite o convite do seu condomínio para recarregar pelo app."
    >
      {token ? (
        <InviteAcceptance token={token} oauthButtons={<OAuthButtons />} />
      ) : (
        <Alert>Link de convite inválido. Abra o link completo enviado por e-mail.</Alert>
      )}
    </AuthLayout>
  )
}
