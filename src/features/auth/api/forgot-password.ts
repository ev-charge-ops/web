import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { ApiError, publicApiClient } from '@/lib/api-client'

export const forgotPasswordInputSchema = z.object({
  email: z.email('Informe um e-mail válido'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>

export async function forgotPassword(input: ForgotPasswordInput) {
  const { response } = await publicApiClient.POST('/auth/password/forgot', {
    body: input,
  })
  if (!response.ok) throw new ApiError(response.status)
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword })
}
