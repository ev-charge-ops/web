import { formatCents, formatCentsAmount } from '@/utils/format-currency'

import type { MonthlyStatement } from '../api/get-statement'
import styles from './statement-summary.module.css'

type StatementTotalCardProps = {
  statement: MonthlyStatement
}

export function StatementTotalCard({ statement }: StatementTotalCardProps) {
  const { totals } = statement
  const parts = [
    { key: 'energy', label: 'Energia', cents: totals.energyCents },
    { key: 'access', label: 'Acesso', cents: totals.accessFeeCents },
    { key: 'idle', label: 'Ocupação', cents: totals.idleFeeCents },
  ] as const

  return (
    <section className={styles.totalCard} aria-labelledby="statement-total-title">
      <h2 id="statement-total-title" className={styles.totalLabel}>
        Total a ratear
      </h2>
      <span className={styles.amount}>
        <span className={styles.totalCurrency}>R$</span>
        <span className={styles.totalValue}>
          {formatCentsAmount(totals.totalCents)}
        </span>
      </span>
      <div className={styles.split} aria-hidden="true">
        {parts
          .filter((part) => part.cents > 0)
          .map((part) => (
            <span
              key={part.key}
              className={styles[part.key]}
              style={{ flexGrow: part.cents }}
            />
          ))}
      </div>
      <ul className={styles.legend}>
        {parts.map((part) => (
          <li key={part.key}>
            <span className={styles[part.key]} aria-hidden="true" />
            {part.label} {formatCents(part.cents)}
          </li>
        ))}
      </ul>
    </section>
  )
}
