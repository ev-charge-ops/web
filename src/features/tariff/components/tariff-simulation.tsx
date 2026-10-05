import { StatusPill } from '@/components/ui/status-pill'
import { formatDemandFactor } from '@/utils/demand'
import { formatCents, formatCentsAmount } from '@/utils/format-currency'

import type { UpdateTariffFormValues } from '../api/update-tariff'
import { parseMinutesInput, parseMoneyInput } from '../utils/form-values'
import {
  chargedIdleMinutes,
  idleFeeCents,
  sessionEnergyCents,
  simulatedEnergyKwh,
  simulatedIdleMinutes,
  visitorRateCents,
} from '../utils/simulation'
import styles from './tariff-simulation.module.css'

type TariffSimulationProps = {
  values: UpdateTariffFormValues
  residentPointCode?: string
  visitorPoint?: { code: string; demandFactor: number }
}

function Amount({ cents }: { cents: number | null }) {
  return (
    <span className={styles.amount}>
      <span className={styles.currency}>R$</span>
      <span className={styles.value}>
        {cents === null ? '—' : formatCentsAmount(cents)}
      </span>
    </span>
  )
}

export function TariffSimulation({
  values,
  residentPointCode,
  visitorPoint,
}: TariffSimulationProps) {
  const utilityRate = parseMoneyInput(values.utilityRate)
  const baseRateInput = values.baseRate.trim()
  const baseRate = baseRateInput === '' ? null : parseMoneyInput(baseRateInput)
  const accessFee = parseMoneyInput(values.accessFee)
  const feePerMinute = parseMoneyInput(values.idleFeePerMinute)
  const feeCap = parseMoneyInput(values.idleFeeCap)
  const grace = parseMinutesInput(values.gracePeriodMinutes)

  const residentCents =
    utilityRate === null
      ? null
      : sessionEnergyCents(simulatedEnergyKwh, utilityRate)
  const hasVisitorRate =
    visitorPoint &&
    utilityRate !== null &&
    !(baseRateInput && baseRate === null)
  const visitorRate = hasVisitorRate
    ? visitorRateCents(baseRate, utilityRate, visitorPoint.demandFactor)
    : null
  const visitorCents =
    visitorRate === null
      ? null
      : sessionEnergyCents(simulatedEnergyKwh, visitorRate)
  const idleCents =
    grace === null || feePerMinute === null || feeCap === null
      ? null
      : idleFeeCents(simulatedIdleMinutes, grace, feePerMinute, feeCap)
  const add = (a: number | null, b: number | null) =>
    a === null || b === null ? null : a + b

  return (
    <aside className={styles.card} aria-labelledby="tariff-simulation-title">
      <div className={styles.heading}>
        <h2 id="tariff-simulation-title" className={styles.title}>
          Simulação: recarga de {simulatedEnergyKwh} kWh
        </h2>
        <span className={styles.subtitle}>Atualiza com as regras ao lado</span>
      </div>

      <div className={styles.case}>
        <div className={styles.caseHead}>
          <span className={styles.caseTitle}>
            Morador{residentPointCode ? ` · ${residentPointCode}` : ''}
          </span>
          <StatusPill tone="charging">A custo</StatusPill>
        </div>
        <span className={styles.formula}>
          {simulatedEnergyKwh} kWh ×{' '}
          {utilityRate === null ? '—' : formatCents(utilityRate)}
        </span>
        <Amount cents={residentCents} />
      </div>

      {visitorPoint ? (
        <div className={styles.case}>
          <div className={styles.caseHead}>
            <span className={styles.caseTitle}>
              Visitante agora · {visitorPoint.code}
            </span>
            <StatusPill tone="info">Comercial</StatusPill>
          </div>
          <span className={styles.formula}>
            {simulatedEnergyKwh} kWh ×{' '}
            {baseRate !== null
              ? formatCents(baseRate)
              : utilityRate === null
                ? '—'
                : formatCents(utilityRate)}{' '}
            × fator {formatDemandFactor(visitorPoint.demandFactor)}
          </span>
          <Amount cents={visitorCents} />
        </div>
      ) : null}

      <div className={styles.idle}>
        <span className={styles.idleTitle}>
          Com {simulatedIdleMinutes} min de ocupação
        </span>
        <span className={styles.idleBody}>
          {grace === null || feePerMinute === null || idleCents === null ? (
            'Preencha a tolerância, a taxa e o teto para simular.'
          ) : (
            <>
              {grace} min de tolerância,{' '}
              {chargedIdleMinutes(simulatedIdleMinutes, grace)} min cobrados ×{' '}
              {formatCents(feePerMinute)} ={' '}
              <strong>{formatCents(idleCents)}</strong>
            </>
          )}
        </span>
        <dl className={styles.idleTotals}>
          <dt>Morador</dt>
          <dd>
            {add(residentCents, idleCents) === null
              ? '—'
              : formatCents(add(residentCents, idleCents) ?? 0)}
          </dd>
          {visitorPoint ? (
            <>
              <dt>Visitante</dt>
              <dd>
                {add(visitorCents, idleCents) === null
                  ? '—'
                  : formatCents(add(visitorCents, idleCents) ?? 0)}
              </dd>
            </>
          ) : null}
        </dl>
      </div>

      <p className={styles.footnote}>
        {accessFee === null
          ? 'A taxa de acesso entra no rateio mensal, não na sessão.'
          : `Taxa de acesso de ${formatCents(accessFee)} por unidade entra no rateio mensal, não na sessão.`}
      </p>
    </aside>
  )
}
