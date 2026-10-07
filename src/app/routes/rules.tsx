import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import { useTariff } from '@/features/tariff/api/get-tariff'
import { TariffForm } from '@/features/tariff/components/tariff-form'
import { ApiError } from '@/lib/api-client'

const pageTitle = 'Regras e tarifas'

function Rules({ organizationId }: { organizationId: string }) {
  const tariff = useTariff(organizationId)

  if (tariff.isPending) {
    return <Spinner label="Carregando regras" />
  }

  if (tariff.error) {
    if (tariff.error instanceof ApiError && tariff.error.status === 404) {
      return (
        <Alert tone="info">
          Este condomínio ainda não tem tarifa configurada. Fale com o suporte
          para fazer a configuração inicial.
        </Alert>
      )
    }
    return (
      <Alert
        action={
          <Button variant="outline" size="sm" onClick={() => tariff.refetch()}>
            Tentar novamente
          </Button>
        }
      >
        Não foi possível carregar as regras do condomínio.
      </Alert>
    )
  }

  return (
    <TariffForm
      key={tariff.data.id}
      organizationId={organizationId}
      tariff={tariff.data}
    />
  )
}

export function RulesRoute() {
  return (
    <ManagedOrganization title={pageTitle}>
      {(organization) => (
        <>
          <PageTitle
            title={pageTitle}
            description="Mudanças valem para as sessões seguintes. As sessões já medidas mantêm a tarifa travada no início."
          />
          <Rules key={organization.id} organizationId={organization.id} />
        </>
      )}
    </ManagedOrganization>
  )
}
