import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarCheck, Info, Sparkles } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-pill'
import { useToast } from '@/components/ui/use-toast'
import type { components } from '@/lib/api-schema'
import { formatDemandFactor, formatDemandSource } from '@/utils/demand'
import { formatDate } from '@/utils/format-date'

import type { Tariff } from '../api/get-tariff'
import {
  updateTariffInputSchema,
  useUpdateTariff,
  type UpdateTariffFormValues,
  type UpdateTariffInput,
} from '../api/update-tariff'
import { getUpdateTariffErrorMessage } from '../utils/error-messages'
import {
  centsToInput,
  parseMoneyInput,
  toTariffFormValues,
} from '../utils/form-values'
import { TariffField } from './tariff-field'
import styles from './tariff-form.module.css'
import { TariffSimulation } from './tariff-simulation'

export type TariffPoint = {
  code: string
  type: components['schemas']['ChargePointType']
  pricing: Pick<
    components['schemas']['ChargePointPricingDto'],
    'demandFactor' | 'demandFactorSource' | 'demandModelVersion'
  > | null
}

type TariffFormProps = {
  organizationId: string
  tariff: Tariff
  chargePoints: TariffPoint[]
}

function joinCodes(codes: string[]) {
  if (codes.length <= 1) return codes.join('')
  return `${codes.slice(0, -1).join(', ')} e ${codes.at(-1)}`
}

export function TariffForm({
  organizationId,
  tariff,
  chargePoints,
}: TariffFormProps) {
  const { showToast } = useToast()
  const updateTariff = useUpdateTariff(organizationId)
  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateTariffFormValues, unknown, UpdateTariffInput>({
    resolver: zodResolver(updateTariffInputSchema),
    defaultValues: toTariffFormValues(tariff),
  })
  const values = useWatch({ control }) as UpdateTariffFormValues

  const residentPoints = chargePoints.filter(
    (point) => point.type === 'PRIVATE',
  )
  const visitorPoints = chargePoints.filter(
    (point) => point.type === 'COMMERCIAL',
  )
  const visitorPricing = visitorPoints.find((point) => point.pricing)

  const stepUtilityRate = (deltaCents: number) => {
    const current = parseMoneyInput(getValues('utilityRate')) ?? 0
    setValue('utilityRate', centsToInput(Math.max(0, current + deltaCents)), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const submit = handleSubmit((input) =>
    updateTariff.mutate(input, {
      onSuccess: (saved) => {
        reset(toTariffFormValues(saved))
        showToast({
          tone: 'success',
          message: 'Regras salvas. Valem para as próximas sessões.',
        })
      },
      onError: (error) =>
        showToast({
          tone: 'error',
          message: getUpdateTariffErrorMessage(error),
        }),
    }),
  )

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <div className={styles.layout}>
        <div className={styles.groups}>
          <section className={styles.group} aria-labelledby="tariff-private">
            <div className={styles.groupHead}>
              <div className={styles.heading}>
                <h2 id="tariff-private" className={styles.title}>
                  Pontos privados
                </h2>
                <span className={styles.subtitle}>
                  {residentPoints.length > 0
                    ? `${joinCodes(residentPoints.map((point) => point.code))} · rateio mensal por unidade`
                    : 'Rateio mensal por unidade'}
                </span>
              </div>
              <StatusPill tone="charging">Sem margem</StatusPill>
            </div>
            <div className={styles.fields}>
              <TariffField
                label="Tarifa de energia (R$ por kWh)"
                prefix="R$"
                inputMode="decimal"
                error={errors.utilityRate?.message}
                stepper={{
                  label: 'R$ 0,01',
                  onDecrease: () => stepUtilityRate(-1),
                  onIncrease: () => stepUtilityRate(1),
                }}
                {...register('utilityRate')}
              />
              <TariffField
                label="Taxa de acesso mensal (R$)"
                prefix="R$"
                suffix="por unidade"
                inputMode="decimal"
                error={errors.accessFee?.message}
                {...register('accessFee')}
              />
              <TariffField
                label="Tolerância após a recarga (minutos)"
                suffix="min"
                inputMode="numeric"
                error={errors.gracePeriodMinutes?.message}
                {...register('gracePeriodMinutes')}
              />
              <TariffField
                label="Taxa de ocupação (R$ por minuto)"
                prefix="R$"
                suffix="/min"
                inputMode="decimal"
                error={errors.idleFeePerMinute?.message}
                {...register('idleFeePerMinute')}
              />
              <TariffField
                label="Teto da ocupação por sessão (R$)"
                prefix="R$"
                suffix="por sessão"
                inputMode="decimal"
                error={errors.idleFeeCap?.message}
                {...register('idleFeeCap')}
              />
            </div>
            <p className={styles.note}>
              <Info size={18} strokeWidth={2} aria-hidden />
              <span>
                Energia repassada a custo, sem margem (ANEEL RN 1.000/2021).
                Tolerância e ocupação valem para todos os pontos.
              </span>
            </p>
          </section>

          <section className={styles.group} aria-labelledby="tariff-visitors">
            <div className={styles.groupHead}>
              <div className={styles.heading}>
                <h2 id="tariff-visitors" className={styles.title}>
                  {visitorPoints.length === 1
                    ? 'Ponto de visitantes'
                    : 'Pontos de visitantes'}
                </h2>
                <span className={styles.subtitle}>
                  {visitorPoints.length > 0
                    ? `${joinCodes(visitorPoints.map((point) => point.code))} · pago com cartão, pré-autorização e captura ao encerrar`
                    : 'Nenhum ponto de visitantes neste condomínio'}
                </span>
              </div>
              <StatusPill tone="info">Comercial</StatusPill>
            </div>
            <div className={styles.fields}>
              <TariffField
                label="Tarifa base de visitantes (R$ por kWh)"
                prefix="R$"
                suffix="/kWh"
                inputMode="decimal"
                placeholder="Igual à de energia"
                error={errors.baseRate?.message}
                {...register('baseRate')}
              />
              <div className={styles.factorField}>
                <span className={styles.factorLabel}>
                  Fator de demanda (IA)
                </span>
                <div className={styles.factorBox}>
                  <Sparkles size={18} strokeWidth={2} aria-hidden />
                  <span className={styles.factorText}>
                    {visitorPricing?.pricing
                      ? formatDemandSource(
                          visitorPricing.pricing.demandFactorSource,
                          visitorPricing.pricing.demandModelVersion,
                        )
                      : 'Aplicado nos pontos de visitantes'}
                  </span>
                  {visitorPricing?.pricing ? (
                    <span className={styles.factorChip}>
                      {formatDemandFactor(visitorPricing.pricing.demandFactor)}{' '}
                      agora
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <p className={styles.infoNote}>
              O preço do visitante é a tarifa base multiplicada pelo fator de
              demanda, previsto pelo modelo a partir do histórico de uso. Vale
              só para visitantes; moradores pagam sempre a tarifa a custo.
            </p>
          </section>
        </div>

        <TariffSimulation
          values={values}
          residentPointCode={residentPoints[0]?.code}
          visitorPoint={
            visitorPricing?.pricing
              ? {
                  code: visitorPricing.code,
                  demandFactor: visitorPricing.pricing.demandFactor,
                }
              : undefined
          }
        />
      </div>

      <div className={styles.footer}>
        <span className={styles.validFrom}>
          <CalendarCheck size={20} strokeWidth={2} aria-hidden />
          Em vigor desde {formatDate(tariff.validFrom)}
        </span>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="lg"
            className={styles.discard}
            disabled={!isDirty || updateTariff.isPending}
            onClick={() => reset(toTariffFormValues(tariff))}
          >
            Descartar
          </Button>
          <Button type="submit" size="lg" isLoading={updateTariff.isPending}>
            Salvar regras
          </Button>
        </div>
      </div>
    </form>
  )
}
