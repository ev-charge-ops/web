import { FileDown, Info } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MonthPicker } from '@/components/ui/month-picker'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'
import { StatusPill } from '@/components/ui/status-pill'
import styles from '@/components/ui/table.module.css'
import { useToast } from '@/components/ui/use-toast'
import { useExportStatementCsv } from '@/features/cost-sharing/api/export-statement-csv'
import { useStatement } from '@/features/cost-sharing/api/get-statement'
import { StatementMetrics } from '@/features/cost-sharing/components/statement-metrics'
import { StatementTable } from '@/features/cost-sharing/components/statement-table'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import { formatMonth, getCurrentMonth, isMonth } from '@/utils/month'

import pageStyles from './cost-sharing.module.css'

const pageTitle = 'Rateio'

function CostSharing({ organizationId }: { organizationId: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const currentMonth = getCurrentMonth()
  const monthParam = searchParams.get('month')
  const month = isMonth(monthParam) ? monthParam : currentMonth
  const statement = useStatement(organizationId, month)
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
        title={`${pageTitle} de ${formatMonth(month)}`}
        tag={
          <StatusPill tone={isOpenMonth ? 'idle' : 'offline'} withDot>
            {isOpenMonth ? 'Mês em aberto' : 'Mês encerrado'}
          </StatusPill>
        }
        description="Energia a custo, sem margem. Cada unidade paga a energia medida com a tarifa travada no início de cada sessão, a taxa de acesso e a ocupação depois da tolerância."
        actions={
          <Button
            icon={<FileDown size={16} strokeWidth={2} aria-hidden />}
            isLoading={exportCsv.isPending}
            disabled={!hasLines}
            onClick={download}
          >
            Exportar CSV
          </Button>
        }
      />

      <div className={pageStyles.toolbar}>
        <MonthPicker
          label="Mês do rateio"
          value={month}
          max={currentMonth}
          onChange={changeMonth}
        />
      </div>

      {statement.isPending ? (
        <div className={pageStyles.state}>
          <Spinner label="Carregando rateio" />
        </div>
      ) : statement.error ? (
        <Alert
          action={
            <Button variant="outline" size="sm" onClick={() => statement.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar o rateio do mês.
        </Alert>
      ) : (
        <>
          <StatementMetrics statement={statement.data} />
          <Card flush>
            <div className={styles.head}>
              <h2 className={styles.title}>Unidades</h2>
              <span className={styles.count}>
                {statement.data.lines.length} · ordenadas pelo valor
              </span>
            </div>
            {hasLines ? (
              <StatementTable statement={statement.data} />
            ) : (
              <p className={styles.empty}>
                Nenhuma unidade no rateio de {formatMonth(month)}.
              </p>
            )}
          </Card>
          <div className={pageStyles.csvNote}>
            <Info size={18} strokeWidth={2} aria-hidden className={pageStyles.csvIcon} />
            <div>
              <div className={pageStyles.csvTitle}>O CSV vai para a administradora</div>
              <p className={pageStyles.csvBody}>
                Uma linha por unidade com kWh, energia, taxa de acesso, ocupação e
                total. Ponto e vírgula como separador e decimal com vírgula, no
                formato aceito pelo importador de boletos.
              </p>
            </div>
          </div>
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
