import { Alert } from '@/components/ui/alert'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'
import { ChargePointsGrid } from '@/features/charge-points/components/charge-points-grid'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import { useOverview } from '@/features/overview/api/get-overview'
import { CapacityCard } from '@/features/overview/components/capacity-card'
import { getCurrentMonth } from '@/utils/month'

import styles from './charge-points.module.css'

const pageTitle = 'Pontos e capacidade'

function SiteCapacity({ organizationId }: { organizationId: string }) {
  const overview = useOverview(organizationId, getCurrentMonth())

  if (overview.isPending) {
    return (
      <div className={styles.state}>
        <Spinner label="Carregando capacidade" />
      </div>
    )
  }

  if (overview.error) {
    return <Alert>Não foi possível carregar a capacidade elétrica.</Alert>
  }

  return <CapacityCard capacity={overview.data.capacity} />
}

export function ChargePointsRoute() {
  return (
    <ManagedOrganization title={pageTitle}>
      {(organization) => (
        <>
          <PageTitle
            title={pageTitle}
            description={`Pontos de recarga de ${organization.name} com status, carregador e preço do kWh agora. A demanda somada nunca passa do limite contratado porque o balanceamento reduz a potência antes.`}
          />
          <div className={styles.layout}>
            <ChargePointsGrid organizationId={organization.id} />
            <SiteCapacity organizationId={organization.id} />
          </div>
          <p className={styles.note}>
            O cadastro e a troca de carregadores são feitos pela equipe de
            implantação. Fale com o suporte para incluir ou alterar um ponto.
          </p>
        </>
      )}
    </ManagedOrganization>
  )
}
