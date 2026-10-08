import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TextField } from '@/components/ui/text-field'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/utils/format-date'

import type { Tariff } from '../api/get-tariff'
import {
  updateTariffInputSchema,
  useUpdateTariff,
  type UpdateTariffFormValues,
  type UpdateTariffInput,
} from '../api/update-tariff'
import { getUpdateTariffErrorMessage } from '../utils/error-messages'
import { toTariffFormValues } from '../utils/form-values'
import styles from './tariff-form.module.css'

type TariffFormProps = {
  organizationId: string
  tariff: Tariff
}

export function TariffForm({ organizationId, tariff }: TariffFormProps) {
  const { showToast } = useToast()
  const updateTariff = useUpdateTariff(organizationId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateTariffFormValues, unknown, UpdateTariffInput>({
    resolver: zodResolver(updateTariffInputSchema),
    defaultValues: toTariffFormValues(tariff),
  })

  const submit = handleSubmit((values) =>
    updateTariff.mutate(values, {
      onSuccess: (saved) => {
        reset(toTariffFormValues(saved))
        showToast({
          tone: 'success',
          message: 'Regras salvas. Valem para as próximas sessões.',
        })
      },
      onError: (error) =>
        showToast({ tone: 'error', message: getUpdateTariffErrorMessage(error) }),
    }),
  )

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <div className={styles.groups}>
        <Card className={styles.group}>
          <div>
            <h2 className={styles.title}>Cobrança</h2>
            <p className={styles.hint}>
              Energia a custo nos pontos dos moradores, sem margem para o
              condomínio.
            </p>
          </div>
          <TextField
            label="Tarifa de energia (R$ por kWh)"
            inputMode="decimal"
            hint="Tarifa da distribuidora, travada no início de cada sessão."
            error={errors.utilityRate?.message}
            {...register('utilityRate')}
          />
          <TextField
            label="Tarifa base de visitantes (R$ por kWh)"
            inputMode="decimal"
            hint="Multiplicada pelo fator de demanda nos pontos de visitantes. Deixe vazio se não houver."
            error={errors.baseRate?.message}
            {...register('baseRate')}
          />
          <TextField
            label="Taxa de acesso mensal (R$)"
            inputMode="decimal"
            hint="Cobrada de cada unidade com veículo vinculado."
            error={errors.accessFee?.message}
            {...register('accessFee')}
          />
        </Card>

        <Card className={styles.group}>
          <div>
            <h2 className={styles.title}>Tolerância e ocupação</h2>
            <p className={styles.hint}>Libera a vaga depois que a recarga termina.</p>
          </div>
          <TextField
            label="Tolerância após a recarga (minutos)"
            inputMode="numeric"
            hint="Sem cobrança de ocupação nesse intervalo."
            error={errors.gracePeriodMinutes?.message}
            {...register('gracePeriodMinutes')}
          />
          <TextField
            label="Taxa de ocupação (R$ por minuto)"
            inputMode="decimal"
            hint="Por minuto excedente depois da tolerância."
            error={errors.idleFeePerMinute?.message}
            {...register('idleFeePerMinute')}
          />
          <TextField
            label="Teto da ocupação por sessão (R$)"
            inputMode="decimal"
            hint="Valor máximo de ocupação cobrado em uma sessão."
            error={errors.idleFeeCap?.message}
            {...register('idleFeeCap')}
          />
        </Card>
      </div>

      <div className={styles.footer}>
        <span className={styles.validFrom}>
          Em vigor desde {formatDate(tariff.validFrom)}. Sessões já iniciadas
          mantêm a tarifa travada.
        </span>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            disabled={!isDirty || updateTariff.isPending}
            onClick={() => reset(toTariffFormValues(tariff))}
          >
            Descartar
          </Button>
          <Button type="submit" isLoading={updateTariff.isPending}>
            Salvar regras
          </Button>
        </div>
      </div>
    </form>
  )
}
