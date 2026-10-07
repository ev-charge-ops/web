import { Card } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import { formatMonthName } from '@/utils/month'

import type { OrganizationOverview } from '../api/get-overview'
import styles from './weekly-energy-chart.module.css'

const valueFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})

type WeeklyEnergyChartProps = {
  overview: OrganizationOverview
}

export function WeeklyEnergyChart({ overview }: WeeklyEnergyChartProps) {
  const weeks = overview.energyByWeek
  const peak = Math.max(0, ...weeks.map(({ energyKwh }) => energyKwh))

  return (
    <Card className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          Consumo por semana · {formatMonthName(overview.month)}
        </h2>
        <span className={styles.hint}>kWh medidos nos pontos do condomínio</span>
      </div>
      <ul className={styles.chart} aria-label="Consumo por semana">
        {weeks.map(({ week, energyKwh }) => (
          <li className={styles.column} key={week}>
            <span className={styles.value}>{valueFormatter.format(energyKwh)}</span>
            <span className={styles.track} aria-hidden>
              <span
                className={cn(
                  styles.bar,
                  energyKwh > 0 && energyKwh === peak && styles.peak,
                )}
                style={{
                  height: `${peak > 0 ? Math.max(2, (energyKwh / peak) * 100) : 2}%`,
                }}
              />
            </span>
            <span className={styles.week}>
              <span className="sr-only">Semana </span>
              <span aria-hidden>Sem </span>
              {week}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
