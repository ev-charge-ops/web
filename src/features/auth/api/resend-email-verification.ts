import { useMutation } from '@tanstack/react-query'

import { ApiError, apiClient } from '@/lib/api-client'

export async function resendEmailVerification() {
  const { response } = await apiClient.POST('/auth/email-verification/resend')
  if (!response.ok) throw new ApiError(response.status)
}

export function useResendEmailVerification() {
  return useMutation({ mutationFn: resendEmailVerification })
}
