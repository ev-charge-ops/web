export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  auth: {
    login: {
      path: '/login',
      getHref: (redirectTo?: string | null) =>
        redirectTo && redirectTo !== '/'
          ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
          : '/login',
    },
    forgotPassword: {
      path: '/forgot-password',
      getHref: () => '/forgot-password',
    },
    resetPassword: {
      path: '/reset-password',
      getHref: (token: string) =>
        `/reset-password?token=${encodeURIComponent(token)}`,
    },
    verifyEmail: {
      path: '/verify-email',
      getHref: (token: string) =>
        `/verify-email?token=${encodeURIComponent(token)}`,
    },
  },
} as const
