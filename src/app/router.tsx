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
    path: paths.auth.appleCallback.path,
    lazy: async () => {
      const { AppleCallbackRoute } = await import('./routes/apple-callback')
      return { Component: AppleCallbackRoute }
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
    path: paths.invite.path,
    lazy: async () => {
      const { InviteRoute } = await import('./routes/invite')
      return { Component: InviteRoute }
    },
  },
  {
    path: paths.legal.privacy.path,
    lazy: async () => {
      const { PrivacyRoute } = await import('./routes/privacy')
      return { Component: PrivacyRoute }
    },
  },
  {
    path: paths.legal.terms.path,
    lazy: async () => {
      const { TermsRoute } = await import('./routes/terms')
      return { Component: TermsRoute }
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
      {
        path: paths.residents.path,
        lazy: async () => {
          const { ResidentsRoute } = await import('./routes/residents')
          return { Component: ResidentsRoute }
        },
      },
      {
        path: paths.sessions.path,
        lazy: async () => {
          const { SessionsRoute } = await import('./routes/sessions')
          return { Component: SessionsRoute }
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
