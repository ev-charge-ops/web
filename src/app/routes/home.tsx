import { useSearchParams } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { MonthPicker } from '@/components/ui/month-picker'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'
import { paths } from '@/config/paths'
import { useStatement } from '@/features/cost-sharing/api/get-statement'
import { ExportCsvButton } from '@/features/cost-sharing/components/export-csv-button'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import {
  overviewLiveRefreshMs,
  useOverview,
} from '@/features/overview/api/get-overview'
import { ElectricalCapacityCard } from '@/features/overview/components/electrical-capacity-card'
import { LiveNowCard } from '@/features/overview/components/live-now-card'
import { OverviewKpis } from '@/features/overview/components/overview-kpis'
import { WeeklyEnergyChart } from '@/features/overview/components/weekly-energy-chart'
import { RecentAnomalies } from '@/features/sessions/components/recent-anomalies'
import { useTariff } from '@/features/tariff/api/get-tariff'
import {
  formatMonthName,
  formatMonthTitle,
  getCurrentMonth,
  isMonth,
  shiftMonth,
} from '@/utils/month'

import styles from './home.module.css'

const pageTitle = 'Visão geral'

function Overview({
  organizationId,
  month,
}: {
  organizationId: string
  month: string
}) {
  const isCurrentMonth = month === getCurrentMonth()
  const previousMonth = shiftMonth(month, -1)
  const overview = useOverview(organizationId, month, {
    refetchInterval: isCurrentMonth ? overviewLiveRefreshMs : false,
  })
  const statement = useStatement(organizationId, month)
  const previousStatement = useStatement(organizationId, previousMonth)
  const tariff = useTariff(organizationId)

  if (overview.isPending) {
    return (
      <div className={styles.state}>
        <Spinner label="Carregando indicadores" />
      </div>
    )
  }

  if (overview.error) {
    return (
      <Alert
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => overview.refetch()}
          >
            Tentar novamente
          </Button>
        }
      >
        Não foi possível carregar os indicadores do condomínio.
      </Alert>
    )
  }

  return (
    <>
      <div className={styles.pair}>
        <LiveNowCard chargePoints={overview.data.chargePoints} />
        <ElectricalCapacityCard
          capacity={overview.data.capacity}
          chargePoints={overview.data.chargePoints}
          monthPeak={overview.data.monthPeak}
        />
      </div>
      <OverviewKpis
        previousMonthName={formatMonthName(previousMonth)}
        units={statement.data?.totals}
        previousUnits={previousStatement.data?.totals}
        visitorSessionsCount={overview.data.visitorSessionsCount}
        utilityRateCents={tariff.data?.utilityRateCents}
        anomaliesCount={overview.data.anomaliesCount}
        pendingReviewCount={overview.data.anomaliesPendingReviewCount}
      />
      <div className={styles.pair}>
        <WeeklyEnergyChart overview={overview.data} />
        <RecentAnomalies
          organizationId={organizationId}
          anomalies={overview.data.recentAnomalies}
          month={month}
          sessionsHref={`${paths.sessions.getHref()}?anomaly=true`}
        />
      </div>
    </>
  )
}

function OverviewPage({ organizationId }: { organizationId: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentMonth = getCurrentMonth()
  const monthParam = searchParams.get('month')
  const month =
    isMonth(monthParam) && monthParam <= currentMonth
      ? monthParam
      : currentMonth

  const changeMonth = (next: string) =>
    setSearchParams(next === currentMonth ? {} : { month: next }, {
      replace: true,
    })

  return (
    <>
      <PageTitle
        eyebrow={formatMonthTitle(month)}
        title={pageTitle}
        actions={
          <>
            <MonthPicker
              label="Mês"
              value={month}
              max={currentMonth}
              isLabelHidden
              isCompact
              onChange={changeMonth}
            />
            <ExportCsvButton organizationId={organizationId} month={month} />
          </>
        }
      />
      <Overview key={month} organizationId={organizationId} month={month} />
    </>
  )
}

export function HomeRoute() {
  return (
    <ManagedOrganization title={pageTitle}>
      {(organization) => (
        <OverviewPage key={organization.id} organizationId={organization.id} />
      )}
    </ManagedOrganization>
  )
}
