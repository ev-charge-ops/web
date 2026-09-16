import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useState, type ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { MainError } from '@/components/errors/main-error'
import { Spinner } from '@/components/ui/spinner'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/lib/auth'
import { createQueryClient } from '@/lib/react-query'

import styles from './provider.module.css'

type AppProviderProps = {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [queryClient] = useState(createQueryClient)

  return (
    <Suspense
      fallback={
        <div className={styles.fallback}>
          <Spinner size="lg" />
        </div>
      }
    >
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
