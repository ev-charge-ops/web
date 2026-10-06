import { useState } from 'react'
import { useSearchParams } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { MonthPicker } from '@/components/ui/month-picker'
import { PageTitle } from '@/components/ui/page-title'
import { Pagination } from '@/components/ui/pagination'
import { SelectField } from '@/components/ui/select-field'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import tableStyles from '@/components/ui/table.module.css'
import { useChargePoints } from '@/features/charge-points/api/get-charge-points'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import { useOverview } from '@/features/overview/api/get-overview'
import {
  useSessions,
  type OrganizationSession,
  type SessionStatus,
} from '@/features/sessions/api/get-sessions'
import { SessionDrawer } from '@/features/sessions/components/session-drawer'
import { SessionsTable } from '@/features/sessions/components/sessions-table'
import {
  sessionStatusLabels,
  sessionStatuses,
} from '@/features/sessions/utils/labels'
import {
  formatMonth,
  formatMonthName,
  formatMonthTitle,
  getCurrentMonth,
  isMonth,
} from '@/utils/month'

import styles from './sessions.module.css'

const pageTitle = 'Sessões'
const pageSize = 20

const statusOptions = [
  { value: '', label: 'Todos os status' },
  ...sessionStatuses.map((status) => ({
    value: status,
    label: sessionStatusLabels[status],
  })),
]

const countFormatter = new Intl.NumberFormat('pt-BR')

function isSessionStatus(value: string | null): value is SessionStatus {
  return sessionStatuses.some((status) => status === value)
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${countFormatter.format(count)} ${count === 1 ? singular : pluralForm}`
}

type Filters = {
  month: string
  status: string
  point: string
  anomaly: boolean
  page: number
}

function SessionsSummary({
  organizationId,
  month,
}: {
  organizationId: string
  month: string
}) {
  const overview = useOverview(organizationId, month)

  if (!overview.data) return <>{formatMonthTitle(month)}</>

  const { sessionsCount, visitorSessionsCount } = overview.data
  const residentCount = Math.max(0, sessionsCount - visitorSessionsCount)

  return (
    <>
      {plural(sessionsCount, 'sessão', 'sessões')} em {formatMonthName(month)}
      {sessionsCount > 0
        ? ` · ${countFormatter.format(residentCount)} de moradores, ${countFormatter.format(visitorSessionsCount)} de visitantes`
        : ''}
    </>
  )
}

function SessionsPage({ organizationId }: { organizationId: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selected, setSelected] = useState<OrganizationSession | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const currentMonth = getCurrentMonth()

  const monthParam = searchParams.get('month')
  const statusParam = searchParams.get('status')
  const filters: Filters = {
    month: isMonth(monthParam) ? monthParam : currentMonth,
    status: isSessionStatus(statusParam) ? statusParam : '',
    point: searchParams.get('point') ?? '',
    anomaly: searchParams.get('anomaly') === 'true',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
  }

  const sessions = useSessions(organizationId, {
    month: filters.month,
    status: isSessionStatus(filters.status) ? filters.status : undefined,
    chargePointId: filters.point || undefined,
    anomaly: filters.anomaly || undefined,
    page: filters.page,
    pageSize,
  })
  const chargePoints = useChargePoints(organizationId)

  const updateFilters = (next: Partial<Filters>) => {
    const merged = { ...filters, page: 1, ...next }
    const params = new URLSearchParams()
    if (merged.month !== currentMonth) params.set('month', merged.month)
    if (merged.status) params.set('status', merged.status)
    if (merged.point) params.set('point', merged.point)
    if (merged.anomaly) params.set('anomaly', 'true')
    if (merged.page > 1) params.set('page', String(merged.page))
    setSearchParams(params, { replace: true })
  }

  const openSession = (session: OrganizationSession) => {
    setSelected(session)
    setIsDrawerOpen(true)
  }

  const pointOptions = [
    { value: '', label: 'Todos os pontos' },
    ...(chargePoints.data ?? []).map((point) => ({
      value: point.id,
      label: `${point.code} · ${point.name}`,
    })),
  ]

  const items = sessions.data?.items ?? []
  const hasFilters = Boolean(filters.status || filters.point || filters.anomaly)

  return (
    <>
      <PageTitle
        eyebrow={
          <SessionsSummary
            organizationId={organizationId}
            month={filters.month}
          />
        }
        title={pageTitle}
      />
      <section className={styles.filters} aria-label="Filtros">
        <MonthPicker
          label="Período"
          value={filters.month}
          max={currentMonth}
          isDense
          onChange={(month) => updateFilters({ month })}
        />
        <SelectField
          label="Ponto"
          options={pointOptions}
          value={filters.point}
          isDense
          className={styles.select}
          onChange={(event) => updateFilters({ point: event.target.value })}
        />
        <SelectField
          label="Status"
          options={statusOptions}
          value={filters.status}
          isDense
          className={styles.select}
          onChange={(event) => updateFilters({ status: event.target.value })}
        />
        <Switch
          label="Somente anomalias"
          checked={filters.anomaly}
          className={styles.switch}
          onChange={(anomaly) => updateFilters({ anomaly })}
        />
      </section>
      <section className={styles.tableCard} aria-label="Lista de sessões">
        {sessions.isPending ? (
          <div className={tableStyles.state}>
            <Spinner label="Carregando sessões" />
          </div>
        ) : sessions.error ? (
          <div className={tableStyles.state}>
            <Alert
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => sessions.refetch()}
                >
                  Tentar novamente
                </Button>
              }
            >
              Não foi possível carregar as sessões.
            </Alert>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            {hasFilters
              ? 'Nenhuma sessão encontrada com esses filtros.'
              : `Nenhuma sessão registrada em ${formatMonth(filters.month)}.`}
          </div>
        ) : (
          <SessionsTable
            sessions={items}
            selectedId={isDrawerOpen ? selected?.id : null}
            onSelect={openSession}
          />
        )}
        {sessions.data ? (
          <Pagination
            page={filters.page}
            pageSize={pageSize}
            total={sessions.data.total}
            itemLabel={sessions.data.total === 1 ? 'sessão' : 'sessões'}
            onChange={(page) => updateFilters({ page })}
          />
        ) : null}
      </section>
      {selected ? (
        <SessionDrawer
          organizationId={organizationId}
          session={selected}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      ) : null}
    </>
  )
}

export function SessionsRoute() {
  return (
    <ManagedOrganization title={pageTitle}>
      {(organization) => (
        <SessionsPage key={organization.id} organizationId={organization.id} />
      )}
    </ManagedOrganization>
  )
}
