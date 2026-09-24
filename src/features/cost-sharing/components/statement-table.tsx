import styles from '@/components/ui/table.module.css'
import { cn } from '@/utils/cn'
import { formatCents } from '@/utils/format-currency'

import type { MonthlyStatement, StatementLine } from '../api/get-statement'

const energyFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function amount(cents: number) {
  return cents > 0 ? formatCents(cents) : '—'
}

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
}

export function StatementTable({ statement }: StatementTableProps) {
  const lines = [...statement.lines].sort(byTotalDescending)
  const { totals } = statement

  return (
    <div className={styles.wrap}>
      <table className={styles.table} aria-label="Rateio por unidade">
        <thead>
          <tr>
            <th scope="col">Unidade</th>
            <th scope="col" className={styles.right}>
              Sessões
            </th>
            <th scope="col" className={styles.right}>
              kWh
            </th>
            <th scope="col" className={styles.right}>
              Energia
            </th>
            <th scope="col" className={styles.right}>
              Acesso
            </th>
            <th scope="col" className={styles.right}>
              Ocupação
            </th>
            <th scope="col" className={styles.right}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.unitLabel ?? 'no-unit'}>
              <th scope="row" className={cn(styles.mono, styles.strong)}>
                {line.unitLabel ?? 'Sem unidade'}
              </th>
              <td className={cn(styles.mono, styles.right, styles.subtle)}>
                {line.sessionsCount || '—'}
              </td>
              <td className={cn(styles.mono, styles.right)}>
                {line.energyKwh > 0 ? energyFormatter.format(line.energyKwh) : '—'}
              </td>
              <td className={cn(styles.mono, styles.right)}>
                {amount(line.energyCents)}
              </td>
              <td className={cn(styles.mono, styles.right, styles.subtle)}>
                {amount(line.accessFeeCents)}
              </td>
              <td
                className={cn(
                  styles.mono,
                  styles.right,
                  line.idleFeeCents > 0 ? styles.danger : styles.subtle,
                )}
              >
                {amount(line.idleFeeCents)}
              </td>
              <td className={cn(styles.mono, styles.right, styles.strong)}>
                {formatCents(line.totalCents)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={styles.totalRow}>
            <th scope="row">Total a ratear</th>
            <td className={cn(styles.mono, styles.right)}>{totals.sessionsCount}</td>
            <td className={cn(styles.mono, styles.right)}>
              {energyFormatter.format(totals.energyKwh)}
            </td>
            <td className={cn(styles.mono, styles.right)}>
              {formatCents(totals.energyCents)}
            </td>
            <td className={cn(styles.mono, styles.right)}>
              {formatCents(totals.accessFeeCents)}
            </td>
            <td className={cn(styles.mono, styles.right, styles.danger)}>
              {formatCents(totals.idleFeeCents)}
            </td>
            <td className={cn(styles.mono, styles.right)}>
              {formatCents(totals.totalCents)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
