import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { ApiError, publicApiClient } from '@/lib/api-client'

export const resetPasswordInputSchema = z
  .object({
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .max(128, 'Use no máximo 128 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>

type ResetPasswordRequest = {
  token: string
  password: string
}

export async function resetPassword(request: ResetPasswordRequest) {
  const { response } = await publicApiClient.POST('/auth/password/reset', {
    body: request,
  })
  if (!response.ok) throw new ApiError(response.status)
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword })
}
