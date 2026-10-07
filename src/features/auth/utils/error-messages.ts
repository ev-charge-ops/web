import { ApiError } from '@/lib/api-client'

export const tooManyRequestsMessage =
  'Muitas tentativas, tente novamente em instantes.'

export const unexpectedErrorMessage =
  'Não foi possível concluir agora. Tente novamente em instantes.'

export function hasStatus(error: unknown, status: number) {
  return error instanceof ApiError && error.status === status
}

export function hasErrorCode(error: unknown, code: string) {
  return error instanceof ApiError && error.code === code
}

export function isRateLimited(error: unknown) {
  return hasStatus(error, 429)
}
