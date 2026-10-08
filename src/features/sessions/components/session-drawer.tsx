import { useId, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'
import { Spinner } from '@/components/ui/spinner'
import { StatusPill } from '@/components/ui/status-pill'
import { useToast } from '@/components/ui/use-toast'
import { ApiError } from '@/lib/api-client'
import { formatDemandFactor, formatDemandSource } from '@/utils/demand'
import { formatCents } from '@/utils/format-currency'
import {
  formatDateTime,
  formatDayMonth,
  formatDayTime,
  formatTime,
} from '@/utils/format-date'
import { formatClockDuration, formatDuration } from '@/utils/format-duration'
import { formatPower } from '@/utils/format-power'

import {
  useOrganizationSession,
  type OrganizationSessionDetail,
} from '../api/get-organization-session'
import type { OrganizationSession } from '../api/get-sessions'
import {
  anomalyReviewNoteMaxLength,
  useReviewSessionAnomaly,
  type AnomalyReviewDecision,
} from '../api/review-session-anomaly'
import {
  anomalyReviewLabels,
  anomalyReviewTones,
  limitTypeLabels,
} from '../utils/labels'
import { getAveragePowerKw, getChargingMinutes } from '../utils/session-metrics'
import { AnomalyScoreCard } from './anomaly-score-card'
import styles from './session-drawer.module.css'

const kwhFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const successMessages = {
  CONFIRMED: 'Anomalia confirmada.',
  DISMISSED: 'Sinalização descartada.',
} satisfies Record<AnomalyReviewDecision, string>

type Line = {
  label: string
  value: string
  hint?: string
}

function DetailLines({ lines }: { lines: Line[] }) {
  return (
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
  )
}

function formatLimit(session: OrganizationSessionDetail) {
  const { limit } = session
  if (limit.type === 'ENERGY' && limit.energyKwh !== null) {
    return `Até ${kwhFormatter.format(limit.energyKwh)} kWh`
  }
  if (limit.type === 'AMOUNT' && limit.amountCents !== null) {
    return `Até ${formatCents(limit.amountCents)}`
  }
  if (limit.type === 'PERCENT' && limit.socPercent !== null) {
    return `Até ${limit.socPercent}%`
  }
  return limitTypeLabels[limit.type]
}

function formatIdle(session: OrganizationSessionDetail) {
  if (session.idleMinutes <= 0) {
    return `Dentro da tolerância de ${session.gracePeriodMinutes} min`
  }
  const duration = `${formatDuration(session.idleMinutes)} após a tolerância`
  return session.idleFeeCents > 0
    ? `${duration} · ${formatCents(session.idleFeeCents)}`
    : duration
}

function formatDemand(session: OrganizationSessionDetail) {
  if (session.regime === 'PRIVATE' && session.demandFactor === 1) {
    return { value: 'Não se aplica', hint: 'Ponto privado' }
  }
  return {
    value: formatDemandFactor(session.demandFactor),
    hint: formatDemandSource(
      session.demandFactorSource,
      session.demandModelVersion,
    ),
  }
}

function getFormula(session: OrganizationSessionDetail) {
  const parts = [
    `${kwhFormatter.format(session.energyKwh)} kWh × ${formatCents(session.lockedRateCents)}`,
  ]
  if (session.idleFeeCents > 0) {
    parts.push(`+ ${formatCents(session.idleFeeCents)} de ocupação`)
  }
  const formula = parts.join(' ')
  return session.regime === 'PRIVATE' ? `${formula}, a custo` : formula
}

function getReviewErrorMessage(error: Error) {
  if (error instanceof ApiError && error.status === 409) {
    return 'Esta sessão não está sinalizada pela IA.'
  }
  return 'Não foi possível salvar a revisão. Tente novamente.'
}

function ChargingSection({ session }: { session: OrganizationSessionDetail }) {
  return (
    <section
      className={styles.section}
      aria-labelledby={`${session.id}-charging`}
    >
      <h3 id={`${session.id}-charging`} className={styles.sectionTitle}>
        Recarga
      </h3>
      <DetailLines
        lines={[
          {
            label: 'Ponto',
            value: `${session.chargePoint.code} · ${session.chargePoint.name}`,
          },
          { label: 'Morador', value: session.driver.name },
          { label: 'Início', value: formatDayTime(session.startedAt) },
          {
            label: 'Fim da recarga',
            value: session.chargingEndedAt
              ? formatDayTime(session.chargingEndedAt)
              : 'Em andamento',
          },
          {
            label: 'Tempo carregando',
            value: formatClockDuration(getChargingMinutes(session)),
          },
          {
            label: 'Energia entregue',
            value: `${kwhFormatter.format(session.energyKwh)} kWh`,
          },
          {
            label: 'Potência média',
            value: formatPower(getAveragePowerKw(session)),
            hint: `${formatPower(session.allocatedPowerKw)} alocados`,
          },
          { label: 'Limite', value: formatLimit(session) },
          {
            label: 'Bateria',
            value: session.socPercent === null ? '—' : `${session.socPercent}%`,
          },
        ]}
      />
    </section>
  )
}

function BillingSection({ session }: { session: OrganizationSessionDetail }) {
  const demand = formatDemand(session)
  return (
    <section
      className={styles.section}
      aria-labelledby={`${session.id}-billing`}
    >
      <h3 id={`${session.id}-billing`} className={styles.sectionTitle}>
        Cobrança
      </h3>
      <DetailLines
        lines={[
          {
            label: 'Tarifa travada',
            value: `${formatCents(session.lockedRateCents)}/kWh às ${formatTime(session.startedAt)}`,
          },
          { label: 'Fator de demanda', ...demand },
          { label: 'Ocupação após a recarga', value: formatIdle(session) },
        ]}
      />
      <div className={styles.total}>
        <span className={styles.totalLabel}>
          Valor da sessão
          <span className={styles.formula}>{getFormula(session)}</span>
        </span>
        <span className={styles.totalValue}>
          {formatCents(session.totalCents)}
        </span>
      </div>
    </section>
  )
}

type ReviewState = {
  isReviewing: boolean
  note: string
  setNote: (note: string) => void
  error: Error | null
}

function ReviewSection({
  session,
  review,
}: {
  session: OrganizationSessionDetail
  review: ReviewState
}) {
  const noteId = useId()
  const status = session.anomalyReviewStatus
  if (!status) return null

  return (
    <section className={styles.review} aria-label="Revisão do gestor">
      <div className={styles.reviewHead}>
        <h3 className={styles.sectionTitle}>Revisão do gestor</h3>
        <StatusPill tone={anomalyReviewTones[status]}>
          {anomalyReviewLabels[status]}
        </StatusPill>
      </div>
      {status !== 'PENDING_REVIEW' ? (
        <p className={styles.reviewBody}>
          {session.anomalyReviewedAt
            ? `Revisada em ${formatDateTime(session.anomalyReviewedAt)}.`
            : 'Revisada.'}
          {session.anomalyReviewNote ? (
            <>
              {' '}
              <span className={styles.reviewNote}>
                “{session.anomalyReviewNote}”
              </span>
            </>
          ) : null}
        </p>
      ) : null}
      {review.isReviewing ? (
        <div className={styles.field}>
          {review.error ? (
            <Alert>{getReviewErrorMessage(review.error)}</Alert>
          ) : null}
          <label htmlFor={noteId} className={styles.label}>
            Observação (opcional)
          </label>
          <textarea
            id={noteId}
            className={styles.note}
            rows={3}
            maxLength={anomalyReviewNoteMaxLength}
            placeholder="Ex.: morador confirmou a recarga de um veículo visitante"
            value={review.note}
            onChange={(event) => review.setNote(event.target.value)}
          />
          <span className={styles.counter}>
            {review.note.length}/{anomalyReviewNoteMaxLength}
          </span>
        </div>
      ) : null}
    </section>
  )
}

type SessionDrawerProps = {
  organizationId: string
  session: OrganizationSession
  isOpen: boolean
  onClose: () => void
}

export function SessionDrawer({
  organizationId,
  session: summary,
  isOpen,
  onClose,
}: SessionDrawerProps) {
  const detail = useOrganizationSession(organizationId, summary.id)
  const reviewMutation = useReviewSessionAnomaly(organizationId)
  const { showToast } = useToast()
  const [isReviewing, setIsReviewing] = useState(false)
  const [note, setNote] = useState('')
  const session = detail.data
  const pendingStatus = reviewMutation.isPending
    ? reviewMutation.variables.status
    : null

  const startReview = () => {
    setNote(session?.anomalyReviewNote ?? '')
    reviewMutation.reset()
    setIsReviewing(true)
  }

  const submit = (status: AnomalyReviewDecision) =>
    reviewMutation.mutate(
      { sessionId: summary.id, status, note },
      {
        onSuccess: () => {
          showToast({ tone: 'success', message: successMessages[status] })
          setIsReviewing(false)
        },
      },
    )

  const eyebrow = [
    summary.regime === 'COMMERCIAL' ? 'Visitante' : summary.unitLabel,
    summary.driver.name,
    formatDayMonth(summary.startedAt),
  ]
    .filter(Boolean)
    .join(' · ')

  const reviewStatus = session?.anomalyReviewStatus

  const footer = !reviewStatus ? null : isReviewing ? (
    <>
      <Button
        size="lg"
        isLoading={pendingStatus === 'CONFIRMED'}
        disabled={reviewMutation.isPending}
        onClick={() => submit('CONFIRMED')}
      >
        Confirmar anomalia
      </Button>
      <Button
        variant="secondary"
        size="lg"
        className={styles.secondary}
        isLoading={pendingStatus === 'DISMISSED'}
        disabled={reviewMutation.isPending}
        onClick={() => submit('DISMISSED')}
      >
        Descartar sinalização
      </Button>
    </>
  ) : (
    <Button
      size="lg"
      variant={reviewStatus === 'PENDING_REVIEW' ? 'primary' : 'secondary'}
      className={
        reviewStatus === 'PENDING_REVIEW' ? undefined : styles.secondary
      }
      onClick={startReview}
    >
      {reviewStatus === 'PENDING_REVIEW' ? 'Revisar' : 'Revisar de novo'}
    </Button>
  )

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={eyebrow}
      title="Detalhes da sessão"
      footer={footer}
    >
      {detail.isPending ? (
        <div className={styles.state}>
          <Spinner label="Carregando sessão" />
        </div>
      ) : detail.error ? (
        <Alert>Não foi possível carregar os detalhes da sessão.</Alert>
      ) : (
        [
          <AnomalyScoreCard key="score" session={detail.data} />,
          <ReviewSection
            key="review"
            session={detail.data}
            review={{
              isReviewing,
              note,
              setNote,
              error: reviewMutation.error,
            }}
          />,
          <ChargingSection key="charging" session={detail.data} />,
          <BillingSection key="billing" session={detail.data} />,
        ]
      )}
    </Drawer>
  )
}
