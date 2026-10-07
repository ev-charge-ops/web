import { QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router'

import { AuthProvider } from '@/lib/auth'
import { createQueryClient } from '@/lib/react-query'

type RenderAppOptions = Omit<RenderOptions, 'wrapper'> & {
  route?: string
}

export function renderApp(
  ui: ReactElement,
  { route = '/', ...options }: RenderAppOptions = {},
) {
  const queryClient = createQueryClient()
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
  return render(ui, { wrapper: Wrapper, ...options })
}
