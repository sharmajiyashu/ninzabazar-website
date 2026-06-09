import { signIn, signOut } from 'next-auth/react'
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

/**
 * Credentials login with role validation and a full-page redirect.
 * Full navigation ensures the session cookie is committed before middleware
 * runs — fixes inconsistent redirects on Vercel production.
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

  window.location.assign(destination)
  return { ok: true }
}

async function signOutAndRedirect(callbackUrl: string): Promise<void> {
  await signOut({ redirect: false })
  window.location.assign(callbackUrl)
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
