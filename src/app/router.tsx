import { createBrowserRouter, RouterProvider } from 'react-router'

import { paths } from '@/config/paths'

const router = createBrowserRouter([
  {
    path: paths.auth.login.path,
    lazy: async () => {
      const { LoginRoute } = await import('./routes/login')
      return { Component: LoginRoute }
    },
  },
  {
    lazy: async () => {
      const { ProtectedRoot } = await import('./routes/protected-root')
      return { Component: ProtectedRoot }
    },
    children: [
      {
        path: paths.home.path,
        lazy: async () => {
          const { HomeRoute } = await import('./routes/home')
          return { Component: HomeRoute }
        },
      },
    ],
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
