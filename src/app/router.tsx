import { createBrowserRouter, RouterProvider } from 'react-router'

import { paths } from '@/config/paths'

const router = createBrowserRouter([
  {
    path: paths.home.path,
    lazy: async () => {
      const { HomeRoute } = await import('./routes/home')
      return { Component: HomeRoute }
    },
  },
  {
    path: '*',
    lazy: async () => {
      const { NotFoundRoute } = await import('./routes/not-found')
      return { Component: NotFoundRoute }
    },
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
