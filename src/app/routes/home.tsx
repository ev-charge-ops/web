import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'
import { StatusPill } from '@/components/ui/status-pill'
import { paths } from '@/config/paths'
import { useMe } from '@/features/auth/api/get-me'
import { roleLabels } from '@/features/auth/utils/role-labels'
import { DynamicPriceCard } from '@/features/charge-points/components/dynamic-price-card'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import { useOverview } from '@/features/overview/api/get-overview'
import { CapacityCard } from '@/features/overview/components/capacity-card'
import { OverviewMetrics } from '@/features/overview/components/overview-metrics'
import { WeeklyEnergyChart } from '@/features/overview/components/weekly-energy-chart'
import { RecentAnomalies } from '@/features/sessions/components/recent-anomalies'
import { useAuth } from '@/lib/use-auth'
import { formatMonth, getCurrentMonth } from '@/utils/month'

import styles from './home.module.css'

function Overview({ organizationId }: { organizationId: string }) {
  const month = getCurrentMonth()
  const overview = useOverview(organizationId, month)

  return (
    <>
      {overview.isPending ? (
        <div className={styles.state}>
          <Spinner label="Carregando indicadores" />
        </div>
      ) : overview.error ? (
        <Alert
          action={
            <Button variant="secondary" size="sm" onClick={() => overview.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar os indicadores do condomínio.
        </Alert>
      ) : (
        <>
          <OverviewMetrics overview={overview.data} />
          <div className={styles.split}>
            <WeeklyEnergyChart overview={overview.data} />
            <CapacityCard capacity={overview.data.capacity} />
          </div>
          <div className={styles.halves}>
            <DynamicPriceCard chargePoints={overview.data.chargePoints} />
            <RecentAnomalies
              anomalies={overview.data.recentAnomalies}
              anomaliesCount={overview.data.anomaliesCount}
              month={month}
              sessionsHref={`${paths.sessions.getHref()}?anomaly=true`}
            />
          </div>
        </>
      )}
    </>
  )
}

export function HomeRoute() {
  const { user: sessionUser } = useAuth()
  const { data: me } = useMe()
  const user = me ?? sessionUser

  return (
    <>
      <PageTitle
        title={user ? `Olá, ${user.name}` : 'Visão geral'}
        description={`Resumo de ${formatMonth(getCurrentMonth())}: energia medida, valor a ratear, capacidade elétrica e o que o modelo de IA está vendo agora.`}
        tag={
          user ? (
            <StatusPill tone="info">{roleLabels[user.role]}</StatusPill>
          ) : null
        }
      />
      <ManagedOrganization>
        {(organization) => (
          <Overview key={organization.id} organizationId={organization.id} />
        )}
      </ManagedOrganization>
    </>
  )
}
