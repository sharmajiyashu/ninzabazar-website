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

  // Hard navigation — cookie is guaranteed on the next request (local + Vercel)
  window.location.assign(destination)
  return { ok: true }
}

/** Sign out and redirect to seller login. */
export function signOutAsSeller() {
  return signOut({ callbackUrl: ROUTES.seller.login, redirect: true })
}

/** Sign out and redirect to buyer homepage. */
export function signOutAsBuyer() {
  return signOut({ callbackUrl: ROUTES.home, redirect: true })
}

export { getPostLoginPath, getLoginPath, type UserRole }
