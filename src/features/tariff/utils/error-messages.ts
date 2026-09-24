import { ApiError } from '@/lib/api-client'

export function getUpdateTariffErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'Confira os valores informados.'
    if (error.status === 403) {
      return 'Sua conta não pode alterar as regras deste condomínio.'
    }
  }
  return 'Não foi possível salvar as regras. Tente novamente em instantes.'
}
