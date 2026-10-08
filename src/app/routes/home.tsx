import { Download } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { MonthPicker } from '@/components/ui/month-picker'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/use-toast'
import { paths } from '@/config/paths'
import { useExportStatementCsv } from '@/features/cost-sharing/api/export-statement-csv'
import { useStatement } from '@/features/cost-sharing/api/get-statement'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import { overviewLiveRefreshMs, useOverview } from '@/features/overview/api/get-overview'
import { ElectricalCapacityCard } from '@/features/overview/components/electrical-capacity-card'
import { LiveNowCard } from '@/features/overview/components/live-now-card'
import { OverviewKpis } from '@/features/overview/components/overview-kpis'
import { WeeklyEnergyChart } from '@/features/overview/components/weekly-energy-chart'
import { RecentAnomalies } from '@/features/sessions/components/recent-anomalies'
import { useTariff } from '@/features/tariff/api/get-tariff'
import {
  formatMonth,
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
  const previousOverview = useOverview(organizationId, previousMonth)
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
          <Button variant="secondary" size="sm" onClick={() => overview.refetch()}>
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
        previousAnomaliesCount={previousOverview.data?.anomaliesCount}
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
  const { showToast } = useToast()
  const currentMonth = getCurrentMonth()
  const monthParam = searchParams.get('month')
  const month = isMonth(monthParam) && monthParam <= currentMonth ? monthParam : currentMonth
  const exportCsv = useExportStatementCsv(organizationId)

  const changeMonth = (next: string) =>
    setSearchParams(next === currentMonth ? {} : { month: next }, {
      replace: true,
    })

  const download = () =>
    exportCsv.mutate(month, {
      onSuccess: (exported) =>
        showToast({
          tone: 'success',
          message: `CSV do rateio de ${formatMonth(exported)} baixado.`,
        }),
      onError: () =>
        showToast({
          tone: 'error',
          message: 'Não foi possível exportar o CSV. Tente novamente.',
        }),
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
            <Button
              icon={<Download size={18} strokeWidth={2} aria-hidden />}
              isLoading={exportCsv.isPending}
              onClick={download}
            >
              Exportar CSV
            </Button>
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
