import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useState, type ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { MainError } from '@/components/errors/main-error'
import { createQueryClient } from '@/lib/react-query'

type AppProviderProps = {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [queryClient] = useState(createQueryClient)

  return (
    <Suspense fallback={null}>
      <ErrorBoundary FallbackComponent={MainError}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  )
}
