import { cn } from '@/utils/cn'
import { getDaysInMonth } from '@/utils/month'

import type { OrganizationOverview } from '../api/get-overview'
import styles from './weekly-energy-chart.module.css'

const valueFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

type WeeklyEnergyChartProps = {
  overview: OrganizationOverview
}

function getWeekRange(week: number, daysInMonth: number) {
  const first = (week - 1) * 7 + 1
  const last = Math.min(week * 7, daysInMonth)
  return first === last ? String(first) : `${first}–${last}`
}

export function WeeklyEnergyChart({ overview }: WeeklyEnergyChartProps) {
  const weeks = overview.energyByWeek
  const peak = Math.max(0, ...weeks.map(({ energyKwh }) => energyKwh))
  const daysInMonth = getDaysInMonth(overview.month)

  return (
    <section className={styles.card} aria-labelledby="weekly-energy-title">
      <div className={styles.head}>
        <h2 id="weekly-energy-title" className={styles.title}>
          Energia por semana
        </h2>
        <span className={styles.unit}>kWh</span>
      </div>
      <ul className={styles.chart} aria-label="Energia por semana">
        {weeks.map(({ week, energyKwh }, index) => {
          const range = getWeekRange(week, daysInMonth)
          return (
            <li
              className={styles.column}
              key={week}
              aria-label={`Dias ${range}: ${valueFormatter.format(energyKwh)} kWh`}
            >
              <span className={styles.plot} aria-hidden="true">
                <span
                  className={styles.value}
                  style={{ animationDelay: `${0.35 + index * 0.05}s` }}
                >
                  {valueFormatter.format(energyKwh)}
                </span>
                <span
                  className={cn(
                    styles.bar,
                    energyKwh > 0 && energyKwh === peak && styles.peak,
                  )}
                  style={{
                    height: `${peak > 0 ? Math.max(2, (energyKwh / peak) * 85) : 2}%`,
                    animationDelay: `${index * 0.05}s`,
                  }}
                />
              </span>
              <span className={styles.week} aria-hidden="true">
                {range}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
