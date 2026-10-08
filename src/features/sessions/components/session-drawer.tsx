import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Drawer } from '@/components/ui/drawer'
import { Spinner } from '@/components/ui/spinner'
import { StatusPill } from '@/components/ui/status-pill'
import { formatDemandFactor, formatDemandSource } from '@/utils/demand'
import { formatCents } from '@/utils/format-currency'
import { formatDateTime } from '@/utils/format-date'
import { formatDuration } from '@/utils/format-duration'
import { formatEnergy } from '@/utils/format-energy'
import { formatPower } from '@/utils/format-power'

import {
  useOrganizationSession,
  type OrganizationSessionDetail,
} from '../api/get-organization-session'
import type { OrganizationSession } from '../api/get-sessions'
import {
  limitTypeLabels,
  regimeLabels,
  sessionStatusLabels,
  sessionStatusTones,
} from '../utils/labels'
import { getAveragePowerKw, getChargingMinutes } from '../utils/session-metrics'
import { AnomalyExplanation } from './anomaly-explanation'
import styles from './session-drawer.module.css'

type Line = {
  label: string
  value: string
  hint?: string
}

function DetailSection({ title, lines }: { title: string; lines: Line[] }) {
  return (
    <Card flush>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <dl className={styles.lines}>
        {lines.map(({ label, value, hint }) => (
          <div className={styles.line} key={label}>
            <dt>
              {label}
              {hint ? <span className={styles.hint}>{hint}</span> : null}
            </dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

function formatLimit(session: OrganizationSessionDetail) {
  const { limit } = session
  if (limit.type === 'ENERGY' && limit.energyKwh !== null) {
    return `${limitTypeLabels.ENERGY} · ${formatEnergy(limit.energyKwh)}`
  }
  if (limit.type === 'AMOUNT' && limit.amountCents !== null) {
    return `${limitTypeLabels.AMOUNT} · ${formatCents(limit.amountCents)}`
  }
  return limitTypeLabels[limit.type]
}

function SessionDetails({ session }: { session: OrganizationSessionDetail }) {
  const demandSource = formatDemandSource(
    session.demandFactorSource,
    session.demandModelVersion,
  )

  const chargingLines: Line[] = [
    {
      label: 'Ponto',
      value: `${session.chargePoint.code} · ${session.chargePoint.name}`,
    },
    { label: 'Unidade', value: session.unitLabel ?? '—' },
    { label: 'Morador', value: session.driver.name },
    { label: 'Início', value: formatDateTime(session.startedAt) },
    {
      label: 'Fim da recarga',
      value: session.chargingEndedAt
        ? formatDateTime(session.chargingEndedAt)
        : '—',
    },
    {
      label: 'Tempo carregando',
      value: formatDuration(getChargingMinutes(session)),
    },
    {
      label: 'Energia',
      value: formatEnergy(session.energyKwh, { maximumFractionDigits: 2 }),
    },
    {
      label: 'Potência média',
      value: formatPower(getAveragePowerKw(session)),
      hint: `${formatPower(session.allocatedPowerKw)} alocados`,
    },
    {
      label: 'Bateria',
      value: session.socPercent === null ? '—' : `${session.socPercent}%`,
    },
    { label: 'Limite', value: formatLimit(session) },
  ]

  const billingLines: Line[] = [
    {
      label: 'Tarifa travada',
      value: `${formatCents(session.lockedRateCents)} / kWh`,
      hint: 'Definida no início da sessão',
    },
    {
      label: 'Fator de demanda',
      value: formatDemandFactor(session.demandFactor),
      hint: demandSource,
    },
    { label: 'Energia', value: formatCents(session.energyCostCents) },
    {
      label: 'Ocupação',
      value: formatCents(session.idleFeeCents),
      hint: `${formatDuration(session.idleMinutes)} após ${session.gracePeriodMinutes} min de tolerância`,
    },
    { label: 'Total', value: formatCents(session.totalCents) },
  ]

  return (
    <>
      <div className={styles.tags}>
        <StatusPill tone={sessionStatusTones[session.status]} withDot>
          {sessionStatusLabels[session.status]}
        </StatusPill>
        <StatusPill tone="offline">{regimeLabels[session.regime]}</StatusPill>
      </div>
      <AnomalyExplanation session={session} />
      <DetailSection title="Recarga" lines={chargingLines} />
      <DetailSection title="Cobrança" lines={billingLines} />
    </>
  )
}

function SessionDrawerBody({
  organizationId,
  sessionId,
}: {
  organizationId: string
  sessionId: string
}) {
  const session = useOrganizationSession(organizationId, sessionId)

  if (session.isPending) {
    return (
      <div className={styles.state}>
        <Spinner label="Carregando sessão" />
      </div>
    )
  }

  if (session.error) {
    return <Alert>Não foi possível carregar os detalhes da sessão.</Alert>
  }

  return <SessionDetails session={session.data} />
}

type SessionDrawerProps = {
  organizationId: string
  session: OrganizationSession | null
  onClose: () => void
}

export function SessionDrawer({
  organizationId,
  session,
  onClose,
}: SessionDrawerProps) {
  return (
    <Drawer
      isOpen={session !== null}
      onClose={onClose}
      title="Detalhes da sessão"
      description={
        session
          ? `${session.driver.name} · ${formatDateTime(session.startedAt)}`
          : undefined
      }
    >
      {session ? (
        <SessionDrawerBody organizationId={organizationId} sessionId={session.id} />
      ) : null}
    </Drawer>
  )
}
