import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'
import { useChargePoints } from '@/features/charge-points/api/get-charge-points'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import { useTariff } from '@/features/tariff/api/get-tariff'
import { TariffForm } from '@/features/tariff/components/tariff-form'
import { ApiError } from '@/lib/api-client'

const pageTitle = 'Regras de tarifa'

function Rules({ organizationId }: { organizationId: string }) {
  const tariff = useTariff(organizationId)
  const chargePoints = useChargePoints(organizationId)

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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => tariff.refetch()}
          >
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
      chargePoints={chargePoints.data ?? []}
    />
  )
}

export function RulesRoute() {
  return (
    <ManagedOrganization title={pageTitle}>
      {(organization) => (
        <>
          <PageTitle
            eyebrow="Valem para novas sessões; a tarifa fica travada no início de cada recarga"
            title={pageTitle}
          />
          <Rules key={organization.id} organizationId={organization.id} />
        </>
      )}
    </ManagedOrganization>
  )
}
