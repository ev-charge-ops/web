import { MailPlus } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'
import { useCurrentOrganization } from '@/features/organizations/hooks/use-current-organization'
import { InviteDrawer } from '@/features/residents/components/invite-drawer'
import { InvitesTable } from '@/features/residents/components/invites-table'
import { MembersTable } from '@/features/residents/components/members-table'

const pageTitle = 'Moradores e convites'

export function ResidentsRoute() {
  const { organization, isPending, error } = useCurrentOrganization()
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  if (isPending) {
    return <Spinner label="Carregando condomínio" />
  }

  if (error || !organization) {
    return (
      <>
        <PageTitle title={pageTitle} />
        <Alert tone={error ? 'error' : 'info'}>
          {error
            ? 'Não foi possível carregar o condomínio.'
            : 'Sua conta ainda não administra nenhum condomínio.'}
        </Alert>
      </>
    )
  }

  return (
    <>
      <PageTitle
        eyebrow={organization.name}
        title={pageTitle}
        description={`O convite vincula a unidade ao morador de ${organization.name}. O morador cria a conta pelo link recebido por e-mail e usa o app para recarregar.`}
        actions={
          <Button
            icon={<MailPlus size={16} strokeWidth={2} aria-hidden />}
            onClick={() => setIsInviteOpen(true)}
          >
            Convidar morador
          </Button>
        }
      />
      <MembersTable organizationId={organization.id} />
      <InvitesTable organizationId={organization.id} />
      <InviteDrawer
        key={organization.id}
        organizationId={organization.id}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </>
  )
}
