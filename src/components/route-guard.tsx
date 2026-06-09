'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  ROUTES,
  isBuyerProtectedRoute,
  isSellerProtectedRoute,
  isSellerRoute,
} from '@/lib/routes'

/**
 * Client-side fallback for protected routes.
 * Middleware is the primary gate — this only redirects after session
 * resolves to unauthenticated (avoids infinite Loading on Vercel).
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const redirected = useRef(false)

  const isProtected =
    isBuyerProtectedRoute(pathname) || isSellerProtectedRoute(pathname)

  const loginPath = isSellerRoute(pathname)
    ? ROUTES.seller.login
    : ROUTES.auth.login

  useEffect(() => {
    redirected.current = false
  }, [pathname])

  useEffect(() => {
    if (!isProtected || status !== 'unauthenticated' || redirected.current) return
    redirected.current = true
    router.replace(loginPath)
  }, [status, isProtected, loginPath, router])

  useEffect(() => {
    if (
      status === 'authenticated' &&
      isSellerProtectedRoute(pathname) &&
      session?.user?.role !== 'SELLER'
    ) {
      router.replace(ROUTES.auth.login)
    }
  }, [status, pathname, session?.user?.role, router])

  if (!isProtected) {
    return <>{children}</>
  }

  // Middleware already verified the session cookie — do not block on loading.
  if (status === 'unauthenticated') {
    return null
  }

  if (
    status === 'authenticated' &&
    isSellerProtectedRoute(pathname) &&
    session?.user?.role !== 'SELLER'
  ) {
    return null
  }

  return <>{children}</>
}
