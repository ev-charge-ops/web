import { useId, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { ApiError } from '@/lib/api-client'

import type { OrganizationSessionDetail } from '../api/get-organization-session'
import {
  anomalyReviewNoteMaxLength,
  useReviewSessionAnomaly,
  type AnomalyReviewDecision,
} from '../api/review-session-anomaly'
import styles from './anomaly-review-form.module.css'

const successMessages = {
  CONFIRMED: 'Anomalia confirmada.',
  DISMISSED: 'Sinalização descartada.',
} satisfies Record<AnomalyReviewDecision, string>

function getErrorMessage(error: Error) {
  if (error instanceof ApiError && error.status === 409) {
    return 'Esta sessão não está sinalizada pela IA.'
  }
  return 'Não foi possível salvar a revisão. Tente novamente.'
}

type AnomalyReviewFormProps = {
  organizationId: string
  sessionId: string
  defaultNote?: string | null
  onReviewed?: (session: OrganizationSessionDetail) => void
}

export function AnomalyReviewForm({
  organizationId,
  sessionId,
  defaultNote,
  onReviewed,
}: AnomalyReviewFormProps) {
  const noteId = useId()
  const [note, setNote] = useState(defaultNote ?? '')
  const { showToast } = useToast()
  const review = useReviewSessionAnomaly(organizationId)
  const pendingStatus = review.isPending ? review.variables.status : null

  const submit = (status: AnomalyReviewDecision) =>
    review.mutate(
      { sessionId, status, note },
      {
        onSuccess: (session) => {
          showToast({ tone: 'success', message: successMessages[status] })
          onReviewed?.(session)
        },
      },
    )

  return (
    <div className={styles.form}>
      {review.error ? <Alert>{getErrorMessage(review.error)}</Alert> : null}
      <div className={styles.field}>
        <label htmlFor={noteId} className={styles.label}>
          Observação (opcional)
        </label>
        <textarea
          id={noteId}
          className={styles.note}
          rows={3}
          maxLength={anomalyReviewNoteMaxLength}
          placeholder="Ex.: morador confirmou a recarga de um veículo visitante"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <span className={styles.counter}>
          {note.length}/{anomalyReviewNoteMaxLength}
        </span>
      </div>
      <div className={styles.actions}>
        <Button
          isLoading={pendingStatus === 'CONFIRMED'}
          disabled={review.isPending}
          onClick={() => submit('CONFIRMED')}
        >
          Confirmar anomalia
        </Button>
        <Button
          variant="secondary"
          isLoading={pendingStatus === 'DISMISSED'}
          disabled={review.isPending}
          onClick={() => submit('DISMISSED')}
        >
          Descartar sinalização
        </Button>
      </div>
      <p className={styles.hint}>
        A revisão fica registrada na sessão. Nenhuma cobrança muda com ela.
      </p>
    </div>
  )
}
