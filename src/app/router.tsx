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
    path: paths.auth.emailLogin.path,
    lazy: async () => {
      const { EmailLoginRoute } = await import('./routes/email-login')
      return { Component: EmailLoginRoute }
    },
  },
  {
    path: paths.auth.forgotPassword.path,
    lazy: async () => {
      const { ForgotPasswordRoute } = await import('./routes/forgot-password')
      return { Component: ForgotPasswordRoute }
    },
  },
  {
    path: paths.auth.resetPassword.path,
    lazy: async () => {
      const { ResetPasswordRoute } = await import('./routes/reset-password')
      return { Component: ResetPasswordRoute }
    },
  },
  {
    path: paths.auth.verifyEmail.path,
    lazy: async () => {
      const { VerifyEmailRoute } = await import('./routes/verify-email')
      return { Component: VerifyEmailRoute }
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
