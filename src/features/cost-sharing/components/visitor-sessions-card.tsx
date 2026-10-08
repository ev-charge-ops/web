import { Spinner } from '@/components/ui/spinner'

import type { VisitorSessions } from '../api/get-visitor-sessions'
import styles from './statement-summary.module.css'

const listFormatter = new Intl.ListFormat('pt-BR', {
  style: 'long',
  type: 'conjunction',
})

type VisitorSessionsCardProps = {
  visitorSessions?: VisitorSessions
  isPending: boolean
}

function describePoints(codes: string[]) {
  if (codes.length === 0) {
    return 'Sem pontos comerciais: todas as sessões entram no rateio.'
  }
  if (codes.length === 1) {
    return `${codes[0]} é ponto comercial: pago no cartão na hora, não entra na conta das unidades.`
  }
  return `${listFormatter.format(codes)} são pontos comerciais: pagos no cartão na hora, não entram na conta das unidades.`
}

export function VisitorSessionsCard({
  visitorSessions,
  isPending,
}: VisitorSessionsCardProps) {
  return (
    <section className={styles.card} aria-labelledby="visitor-sessions-title">
      <h2 id="visitor-sessions-title" className={styles.cardLabel}>
        Fora do rateio
      </h2>
      {visitorSessions ? (
        <>
          <span className={styles.amount}>
            <span className={styles.count}>{visitorSessions.sessionsCount}</span>
            <span className={styles.countUnit}>
              {visitorSessions.sessionsCount === 1
                ? 'sessão de visitante'
                : 'sessões de visitantes'}
            </span>
          </span>
          <p className={styles.note}>
            {describePoints(visitorSessions.commercialPointCodes)}
          </p>
        </>
      ) : isPending ? (
        <Spinner size="sm" label="Carregando sessões de visitantes" />
      ) : (
        <p className={styles.note}>
          Não foi possível contar as sessões de visitantes agora.
        </p>
      )}
    </section>
  )
}
