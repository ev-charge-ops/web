import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { apiClient, toApiError } from '@/lib/api-client'
import type { components } from '@/lib/api-schema'
import { formatCents } from '@/utils/format-currency'

import { getTariffQueryOptions, type Tariff } from './get-tariff'

export type UpdateTariffBody = components['schemas']['UpdateTariffDto']

const moneyPattern = /^\d{1,6}([.,]\d{1,2})?$/

function toCents(value: string) {
  return Math.round(Number(value.replace(',', '.')) * 100)
}

function moneyFormatMessage(label: string) {
  return `Informe ${label} em reais, como 0,89`
}

function maxMessage(maxCents: number) {
  return `Use no máximo ${formatCents(maxCents)}`
}

function money(label: string, maxCents: number) {
  return z
    .string()
    .trim()
    .regex(moneyPattern, moneyFormatMessage(label))
    .transform(toCents)
    .refine((cents) => cents <= maxCents, { message: maxMessage(maxCents) })
}

function optionalMoney(label: string, maxCents: number) {
  return z
    .string()
    .trim()
    .refine((value) => value === '' || moneyPattern.test(value), {
      message: moneyFormatMessage(label),
    })
    .transform((value) => (value === '' ? null : toCents(value)))
    .refine((cents) => cents === null || cents <= maxCents, {
      message: maxMessage(maxCents),
    })
}

export const updateTariffInputSchema = z.object({
  utilityRate: money('a tarifa', 10000),
  baseRate: optionalMoney('a tarifa base', 10000),
  accessFee: money('a taxa de acesso', 100000),
  idleFeePerMinute: money('a taxa por minuto', 10000),
  idleFeeCap: money('o teto', 100000),
  gracePeriodMinutes: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, 'Informe os minutos em números inteiros')
    .transform(Number)
    .refine((minutes) => minutes <= 240, {
      message: 'Use no máximo 240 minutos',
    }),
})

export type UpdateTariffFormValues = z.input<typeof updateTariffInputSchema>
export type UpdateTariffInput = z.output<typeof updateTariffInputSchema>

export function toUpdateTariffBody(input: UpdateTariffInput): UpdateTariffBody {
  return {
    utilityRateCents: input.utilityRate,
    baseRateCents: input.baseRate,
    accessFeeCents: input.accessFee,
    idleFeeCentsPerMinute: input.idleFeePerMinute,
    idleFeeCapCents: input.idleFeeCap,
    gracePeriodMinutes: input.gracePeriodMinutes,
  }
}

export async function updateTariff(
  organizationId: string,
  body: UpdateTariffBody,
): Promise<Tariff> {
  const { data, error, response } = await apiClient.PATCH(
    '/organizations/{organizationId}/tariff',
    { params: { path: { organizationId } }, body },
  )
  if (!data) throw toApiError(response, error)
  return data
}

export function useUpdateTariff(organizationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateTariffInput) =>
      updateTariff(organizationId, toUpdateTariffBody(input)),
    onSuccess: (tariff) => {
      queryClient.setQueryData(
        getTariffQueryOptions(organizationId).queryKey,
        tariff,
      )
      return queryClient.invalidateQueries({ queryKey: ['charge-points'] })
    },
  })
}
