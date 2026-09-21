const appleScriptUrl =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'

type AppleSignInResponse = {
  authorization: { id_token: string; code: string; state?: string }
  user?: {
    email?: string
    name?: { firstName?: string; lastName?: string }
  }
}

type AppleIdSdk = {
  auth: {
    init: (config: {
      clientId: string
      scope: string
      redirectURI: string
      usePopup: boolean
    }) => void
    signIn: () => Promise<AppleSignInResponse>
  }
}

declare global {
  interface Window {
    AppleID?: AppleIdSdk
  }
}

export type AppleCredential = {
  identityToken: string
  givenName?: string
  familyName?: string
}

export class AppleSignInCancelledError extends Error {
  constructor() {
    super('Sign in with Apple was cancelled')
    this.name = 'AppleSignInCancelledError'
  }
}

const cancelledErrors = new Set(['popup_closed_by_user', 'user_cancelled_authorize'])

let scriptPromise: Promise<AppleIdSdk> | null = null

function loadAppleSdk() {
  if (window.AppleID) return Promise.resolve(window.AppleID)
  scriptPromise ??= new Promise<AppleIdSdk>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = appleScriptUrl
    script.async = true
    script.onload = () =>
      window.AppleID
        ? resolve(window.AppleID)
        : reject(new Error('Sign in with Apple is unavailable'))
    script.onerror = () => {
      scriptPromise = null
      script.remove()
      reject(new Error('Failed to load Sign in with Apple'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

function isCancelled(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    cancelledErrors.has(String(error.error))
  )
}

type SignInWithAppleOptions = {
  clientId: string
  redirectUri: string
}

export async function signInWithApple({
  clientId,
  redirectUri,
}: SignInWithAppleOptions): Promise<AppleCredential> {
  const sdk = await loadAppleSdk()
  sdk.auth.init({
    clientId,
    scope: 'name email',
    redirectURI: redirectUri,
    usePopup: true,
  })
  try {
    const { authorization, user } = await sdk.auth.signIn()
    return {
      identityToken: authorization.id_token,
      givenName: user?.name?.firstName,
      familyName: user?.name?.lastName,
    }
  } catch (error) {
    if (isCancelled(error)) throw new AppleSignInCancelledError()
    throw error
  }
}
