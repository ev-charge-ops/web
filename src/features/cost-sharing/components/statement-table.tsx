import { cn } from '@/utils/cn'
import { formatCents } from '@/utils/format-currency'

import type { MonthlyStatement, StatementLine } from '../api/get-statement'
import styles from './statement-table.module.css'

const energyFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function byTotalDescending(a: StatementLine, b: StatementLine) {
  return (
    b.totalCents - a.totalCents ||
    (a.unitLabel ?? '').localeCompare(b.unitLabel ?? '', 'pt-BR', {
      numeric: true,
    })
  )
}

type StatementTableProps = {
  statement: MonthlyStatement
  emptyMessage: string
}

export function StatementTable({ statement, emptyMessage }: StatementTableProps) {
  if (statement.lines.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>
  }

  const lines = [...statement.lines].sort(byTotalDescending)
  const { totals } = statement
  const maxEnergy = Math.max(0, ...lines.map((line) => line.energyKwh))

  return (
    <div className={styles.wrap}>
      <table className={styles.table} aria-label="Rateio por unidade">
        <thead>
          <tr>
            <th scope="col">Unidade</th>
            <th scope="col">Sessões</th>
            <th scope="col">kWh</th>
            <th scope="col">Energia</th>
            <th scope="col">Acesso</th>
            <th scope="col">Ocupação</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.unitLabel ?? 'no-unit'}>
              <th scope="row">{line.unitLabel ?? 'Sem unidade'}</th>
              <td className={styles.body}>{line.sessionsCount}</td>
              <td>
                <div className={styles.energy}>
                  <span className={styles.track} aria-hidden="true">
                    <span
                      className={styles.fill}
                      style={{
                        width: `${maxEnergy > 0 ? (line.energyKwh / maxEnergy) * 100 : 0}%`,
                      }}
                    />
                  </span>
                  <span className={styles.kwh}>
                    {energyFormatter.format(line.energyKwh)}
                  </span>
                </div>
              </td>
              <td>{formatCents(line.energyCents)}</td>
              <td className={styles.body}>{formatCents(line.accessFeeCents)}</td>
              <td className={line.idleFeeCents > 0 ? styles.idle : styles.muted}>
                {formatCents(line.idleFeeCents)}
              </td>
              <td className={styles.total}>{formatCents(line.totalCents)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">
              {totals.unitsCount === 1 ? '1 unidade' : `${totals.unitsCount} unidades`}
            </th>
            <td>{totals.sessionsCount}</td>
            <td>{energyFormatter.format(totals.energyKwh)}</td>
            <td>{formatCents(totals.energyCents)}</td>
            <td>{formatCents(totals.accessFeeCents)}</td>
            <td>{formatCents(totals.idleFeeCents)}</td>
            <td className={cn(styles.total, styles.grandTotal)}>
              {formatCents(totals.totalCents)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
