import { signIn, signOut, getSession } from 'next-auth/react'
import {
  getPostLoginPath,
  getLoginPath,
  type UserRole,
  authDebug,
} from '@/lib/auth-config'
import { ROUTES } from '@/lib/routes'

export type SignInResult =
  | { ok: true }
  | { ok: false; error: string }

/** Wait until the session cookie is readable by the client (post-login). */
async function waitForClientSession(maxAttempts = 25): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const session = await getSession()
    if (session?.user) return true
    await new Promise((resolve) => setTimeout(resolve, 120))
  }
  return false
}

/**
 * Credentials login with role validation and a full-page redirect.
 * Waits for the session before navigating — fixes Vercel cookie timing issues.
 */
export async function signInWithRole(
  email: string,
  password: string,
  role: UserRole
): Promise<SignInResult> {
  const destination = getPostLoginPath(role)

  const response = await signIn('credentials', {
    redirect: false,
    email,
    password,
    role,
    callbackUrl: destination,
  })

  authDebug('signInWithRole', {
    role,
    ok: response?.ok,
    error: response?.error,
    destination,
  })

  if (!response?.ok) {
    return {
      ok: false,
      error: response?.error ?? 'Incorrect username or password',
    }
  }

  const sessionReady = await waitForClientSession()
  authDebug('signInWithRole:session', { sessionReady, destination })

  // Hard navigation — ensures middleware reads the cookie on the next request
  window.location.replace(destination)
  return { ok: true }
}

async function signOutAndRedirect(callbackUrl: string): Promise<void> {
  await signOut({ redirect: false })
  window.location.replace(callbackUrl)
}

/** Sign out and redirect to seller login. */
export function signOutAsSeller(): Promise<void> {
  return signOutAndRedirect(ROUTES.seller.login)
}

/** Sign out and redirect to buyer homepage. */
export function signOutAsBuyer(): Promise<void> {
  return signOutAndRedirect(ROUTES.home)
}

export { getPostLoginPath, getLoginPath, type UserRole }
