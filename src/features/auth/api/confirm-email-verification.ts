import { useMutation } from '@tanstack/react-query'

import { ApiError, publicApiClient } from '@/lib/api-client'

export async function confirmEmailVerification(token: string) {
  const { response } = await publicApiClient.POST(
    '/auth/email-verification/confirm',
    { body: { token } },
  )
  if (!response.ok) throw new ApiError(response.status)
}

export function useConfirmEmailVerification() {
  return useMutation({ mutationFn: confirmEmailVerification })
}
