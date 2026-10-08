export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  residents: {
    path: '/residents',
    getHref: () => '/residents',
  },
  sessions: {
    path: '/sessions',
    getHref: () => '/sessions',
  },
  costSharing: {
    path: '/cost-sharing',
    getHref: () => '/cost-sharing',
  },
  chargePoints: {
    path: '/charge-points',
    getHref: () => '/charge-points',
  },
  rules: {
    path: '/rules',
    getHref: () => '/rules',
  },
  invite: {
    path: '/invite',
    getHref: (token: string) => `/invite?token=${encodeURIComponent(token)}`,
  },
  auth: {
    login: {
      path: '/login',
      getHref: (redirectTo?: string | null) =>
        redirectTo && redirectTo !== '/'
          ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
          : '/login',
    },
    emailLogin: {
      path: '/login/email',
      getHref: (redirectTo?: string | null) =>
        redirectTo && redirectTo !== '/'
          ? `/login/email?redirectTo=${encodeURIComponent(redirectTo)}`
          : '/login/email',
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
    appleCallback: {
      path: '/auth/apple/callback',
      getHref: () => '/auth/apple/callback',
    },
    verifyEmail: {
      path: '/verify-email',
      getHref: (token: string) =>
        `/verify-email?token=${encodeURIComponent(token)}`,
    },
  },
  legal: {
    privacy: {
      path: '/privacidade',
      getHref: () => '/privacidade',
    },
    terms: {
      path: '/termos',
      getHref: () => '/termos',
    },
    support: {
      path: '/suporte',
      getHref: () => '/suporte',
    },
  },
} as const
