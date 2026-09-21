import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppleSignInCancelledError, signInWithApple } from './apple-sign-in'

const options = {
  clientId: 'apple-services-id',
  redirectUri: 'https://app.example.com/auth/apple/callback',
}

function installSdk(signIn: () => Promise<unknown>) {
  const init = vi.fn()
  window.AppleID = { auth: { init, signIn } } as unknown as Window['AppleID']
  return init
}

describe('signInWithApple', () => {
  afterEach(() => {
    delete window.AppleID
  })

  it('initializes the SDK in popup mode and returns the identity token', async () => {
    const init = installSdk(async () => ({
      authorization: { id_token: 'identity-token', code: 'code' },
      user: { name: { firstName: 'Ana', lastName: 'Souza' } },
    }))

    await expect(signInWithApple(options)).resolves.toEqual({
      identityToken: 'identity-token',
      givenName: 'Ana',
      familyName: 'Souza',
    })
    expect(init).toHaveBeenCalledWith({
      clientId: 'apple-services-id',
      scope: 'name email',
      redirectURI: 'https://app.example.com/auth/apple/callback',
      usePopup: true,
    })
  })

  it('maps a closed popup to a cancellation error', async () => {
    installSdk(() => Promise.reject({ error: 'popup_closed_by_user' }))

    await expect(signInWithApple(options)).rejects.toBeInstanceOf(
      AppleSignInCancelledError,
    )
  })

  it('loads the SDK script when it is not available', async () => {
    const promise = signInWithApple(options)
    const script = document.head.querySelector<HTMLScriptElement>(
      'script[src*="appleid.auth.js"]',
    )
    expect(script).not.toBeNull()

    installSdk(async () => ({
      authorization: { id_token: 'identity-token', code: 'code' },
    }))
    script?.dispatchEvent(new Event('load'))

    await expect(promise).resolves.toEqual({
      identityToken: 'identity-token',
      givenName: undefined,
      familyName: undefined,
    })
  })
})
