import { formatCents } from '@/utils/format-currency'

import styles from './statement-summary.module.css'

type CostFormulaCardProps = {
  utilityRateCents?: number
  accessFeeCents: number
  gracePeriodMinutes?: number
}

export function CostFormulaCard({
  utilityRateCents,
  accessFeeCents,
  gracePeriodMinutes,
}: CostFormulaCardProps) {
  const tolerance =
    gracePeriodMinutes === undefined
      ? 'a tolerância'
      : `${gracePeriodMinutes} min de tolerância`

  return (
    <section className={styles.card} aria-labelledby="cost-formula-title">
      <h2 id="cost-formula-title" className={styles.cardLabel}>
        Como cada unidade é calculada
      </h2>
      <p className={styles.formula}>
        <span className={styles.energyChip}>
          {utilityRateCents === undefined
            ? 'kWh × tarifa'
            : `kWh × ${formatCents(utilityRateCents)}`}
        </span>
        <span className={styles.operator}>+</span>
        <span className={styles.accessChip}>
          acesso {formatCents(accessFeeCents)}
        </span>
        <span className={styles.operator}>+</span>
        <span className={styles.idleChip}>ocupação</span>
      </p>
      <p className={styles.note}>
        Energia repassada a custo, sem margem (ANEEL RN 1.000/2021). Ocupação
        cobrada por minuto após {tolerance}.
      </p>
    </section>
  )
}
