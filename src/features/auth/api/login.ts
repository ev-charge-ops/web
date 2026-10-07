import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { ApiError, publicApiClient } from '@/lib/api-client'
import { useAuth, type AuthSession } from '@/lib/use-auth'

export const loginInputSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
})

export type LoginInput = z.infer<typeof loginInputSchema>

export async function login(input: LoginInput): Promise<AuthSession> {
  const { data, response } = await publicApiClient.POST('/auth/login', {
    body: input,
  })
  if (!data) throw new ApiError(response.status)
  return data
}

type UseLoginOptions = {
  onSuccess?: (session: AuthSession) => void
}

export function useLogin({ onSuccess }: UseLoginOptions = {}) {
  const { signIn } = useAuth()
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      signIn(session)
      onSuccess?.(session)
    },
  })
}
