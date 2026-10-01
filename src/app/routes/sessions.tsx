import { useState } from 'react'
import { useSearchParams } from 'react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckboxField } from '@/components/ui/checkbox-field'
import { MonthPicker } from '@/components/ui/month-picker'
import { PageTitle } from '@/components/ui/page-title'
import { Pagination } from '@/components/ui/pagination'
import { SelectField } from '@/components/ui/select-field'
import { Spinner } from '@/components/ui/spinner'
import styles from '@/components/ui/table.module.css'
import { useChargePoints } from '@/features/charge-points/api/get-charge-points'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
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
import { formatMonth, formatMonthTitle, getCurrentMonth, isMonth } from '@/utils/month'

const pageTitle = 'Sessões'
const pageSize = 50

const statusOptions = [
  { value: '', label: 'Todos os status' },
  ...sessionStatuses.map((status) => ({
    value: status,
    label: sessionStatusLabels[status],
  })),
]

function isSessionStatus(value: string | null): value is SessionStatus {
  return sessionStatuses.some((status) => status === value)
}

type Filters = {
  month: string
  status: string
  point: string
  anomaly: boolean
  page: number
}

function SessionsPage({ organizationId }: { organizationId: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selected, setSelected] = useState<OrganizationSession | null>(null)
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

  const pointOptions = [
    { value: '', label: 'Todos os pontos' },
    ...(chargePoints.data ?? []).map((point) => ({
      value: point.id,
      label: `${point.code} · ${point.name}`,
    })),
  ]

  const items = sessions.data?.items ?? []
  const flaggedCount = items.filter((session) => session.isAnomaly).length
  const hasFilters = Boolean(filters.status || filters.point || filters.anomaly)

  return (
    <>
      <PageTitle
        eyebrow={formatMonthTitle(filters.month)}
        title={pageTitle}
        description="Registro de cada recarga medida no condomínio. Toda linha do rateio nasce daqui. Sessões que o modelo de IA considerou atípicas aparecem destacadas."
      />
      <Card flush>
        <div className={styles.head}>
          <h2 className={styles.title}>
            Sessões de {formatMonth(filters.month)}
          </h2>
          {sessions.data ? (
            <span className={styles.count}>
              {sessions.data.total}
              {flaggedCount > 0
                ? ` · ${flaggedCount} sinalizada${flaggedCount > 1 ? 's' : ''} pela IA`
                : ''}
            </span>
          ) : null}
        </div>
        <div className={styles.toolbar}>
          <MonthPicker
            label="Período"
            value={filters.month}
            max={currentMonth}
            onChange={(month) => updateFilters({ month })}
          />
          <SelectField
            label="Ponto"
            options={pointOptions}
            value={filters.point}
            onChange={(event) => updateFilters({ point: event.target.value })}
          />
          <SelectField
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={(event) => updateFilters({ status: event.target.value })}
          />
          <CheckboxField
            label="Somente anomalias"
            checked={filters.anomaly}
            onChange={(event) => updateFilters({ anomaly: event.target.checked })}
          />
        </div>
        {sessions.isPending ? (
          <div className={styles.state}>
            <Spinner label="Carregando sessões" />
          </div>
        ) : sessions.error ? (
          <div className={styles.state}>
            <Alert
              action={
                <Button variant="secondary" size="sm" onClick={() => sessions.refetch()}>
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
          <SessionsTable sessions={items} onSelect={setSelected} />
        )}
        {sessions.data ? (
          <Pagination
            page={filters.page}
            pageSize={pageSize}
            total={sessions.data.total}
            onChange={(page) => updateFilters({ page })}
          />
        ) : null}
      </Card>
      <SessionDrawer
        organizationId={organizationId}
        session={selected}
        onClose={() => setSelected(null)}
      />
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
