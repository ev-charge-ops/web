import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useState, type ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { MainError } from '@/components/errors/main-error'
import { FullPageSpinner } from '@/components/layouts/full-page-spinner'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/lib/auth'
import { createQueryClient } from '@/lib/react-query'

type AppProviderProps = {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [queryClient] = useState(createQueryClient)

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <ErrorBoundary FallbackComponent={MainError}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  )
}
