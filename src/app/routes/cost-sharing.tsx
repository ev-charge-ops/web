import { Download } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { MonthPicker } from '@/components/ui/month-picker'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/use-toast'
import { useExportStatementCsv } from '@/features/cost-sharing/api/export-statement-csv'
import { useStatement } from '@/features/cost-sharing/api/get-statement'
import { useVisitorSessions } from '@/features/cost-sharing/api/get-visitor-sessions'
import { CostFormulaCard } from '@/features/cost-sharing/components/cost-formula-card'
import { StatementSummary } from '@/features/cost-sharing/components/statement-summary'
import { StatementTable } from '@/features/cost-sharing/components/statement-table'
import { StatementTotalCard } from '@/features/cost-sharing/components/statement-total-card'
import { VisitorSessionsCard } from '@/features/cost-sharing/components/visitor-sessions-card'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import { useTariff } from '@/features/tariff/api/get-tariff'
import {
  formatMonth,
  formatMonthTitle,
  getCurrentMonth,
  getMonthLastDay,
  isMonth,
} from '@/utils/month'

import pageStyles from './cost-sharing.module.css'

const pageTitle = 'Rateio mensal'

function CostSharing({ organizationId }: { organizationId: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const currentMonth = getCurrentMonth()
  const monthParam = searchParams.get('month')
  const month = isMonth(monthParam) ? monthParam : currentMonth
  const statement = useStatement(organizationId, month)
  const tariff = useTariff(organizationId)
  const visitorSessions = useVisitorSessions(organizationId, month)
  const exportCsv = useExportStatementCsv(organizationId)
  const isOpenMonth = month === currentMonth

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

  const hasLines = Boolean(statement.data && statement.data.lines.length > 0)

  return (
    <>
      <PageTitle
        eyebrow={`${formatMonthTitle(month)} · ${isOpenMonth ? 'aberto' : `fechado em ${getMonthLastDay(month)}`}`}
        title={pageTitle}
        actions={
          <>
            <MonthPicker
              label="Mês do rateio"
              value={month}
              max={currentMonth}
              isLabelHidden
              isCompact
              onChange={changeMonth}
            />
            <Button
              icon={<Download size={18} strokeWidth={2} aria-hidden />}
              isLoading={exportCsv.isPending}
              disabled={!hasLines}
              onClick={download}
            >
              Exportar CSV
            </Button>
          </>
        }
      />

      {statement.isPending ? (
        <div className={pageStyles.state}>
          <Spinner label="Carregando rateio" />
        </div>
      ) : statement.error ? (
        <Alert
          action={
            <Button variant="secondary" size="sm" onClick={() => statement.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar o rateio do mês.
        </Alert>
      ) : (
        <>
          <StatementSummary>
            <StatementTotalCard statement={statement.data} />
            <CostFormulaCard
              utilityRateCents={tariff.data?.utilityRateCents}
              accessFeeCents={statement.data.accessFeeCents}
              gracePeriodMinutes={tariff.data?.gracePeriodMinutes}
            />
            <VisitorSessionsCard
              visitorSessions={visitorSessions.data}
              isPending={visitorSessions.isPending}
            />
          </StatementSummary>
          <StatementTable
            statement={statement.data}
            emptyMessage={`Nenhuma unidade no rateio de ${formatMonth(month)}.`}
          />
        </>
      )}
    </>
  )
}

export function CostSharingRoute() {
  return (
    <ManagedOrganization title={pageTitle}>
      {(organization) => (
        <CostSharing key={organization.id} organizationId={organization.id} />
      )}
    </ManagedOrganization>
  )
}
