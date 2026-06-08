import { signOut } from 'next-auth/react'
import { ROUTES } from '@/lib/routes'

/** Sign out and redirect to seller login (pathname-only — works on local and production). */
export function signOutAsSeller() {
  return signOut({ callbackUrl: ROUTES.seller.login, redirect: true })
}

/** Sign out and redirect to buyer homepage. */
export function signOutAsBuyer() {
  return signOut({ callbackUrl: ROUTES.home, redirect: true })
}
