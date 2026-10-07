import type { ReactNode } from 'react'

import { Alert } from '@/components/ui/alert'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'

import type { MyOrganization } from '../api/get-my-organizations'
import { useCurrentOrganization } from '../hooks/use-current-organization'

type ManagedOrganizationProps = {
  title: string
  children: (organization: MyOrganization) => ReactNode
}

export function ManagedOrganization({ title, children }: ManagedOrganizationProps) {
  const { organization, isPending, error } = useCurrentOrganization()

  if (isPending) {
    return <Spinner label="Carregando condomínio" />
  }

  if (error || !organization) {
    return (
      <>
        <PageTitle title={title} />
        <Alert tone={error ? 'error' : 'info'}>
          {error
            ? 'Não foi possível carregar o condomínio.'
            : 'Sua conta ainda não administra nenhum condomínio.'}
        </Alert>
      </>
    )
  }

  return <>{children(organization)}</>
}
