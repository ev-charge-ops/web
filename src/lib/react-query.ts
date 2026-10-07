import { QueryClient, type DefaultOptions } from '@tanstack/react-query'

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 60 * 1000,
  },
} satisfies DefaultOptions

export function createQueryClient() {
  return new QueryClient({ defaultOptions: queryConfig })
}
