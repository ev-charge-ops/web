import { ApiError } from '@/lib/api-client'

const genericMessage =
  'Não foi possível concluir agora. Tente novamente em instantes.'

export function getCreateInviteErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === 'ALREADY_MEMBER') {
      return 'Este e-mail já pertence a um morador do condomínio.'
    }
    if (error.code === 'INVITE_ALREADY_PENDING') {
      return 'Já existe um convite pendente para este e-mail. Reenvie o convite pela lista.'
    }
    if (error.status === 400) return 'Confira o e-mail e a unidade informados.'
  }
  return genericMessage
}

export function getInviteActionErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return 'Este convite não pode mais ser alterado. A lista foi atualizada.'
  }
  return genericMessage
}
