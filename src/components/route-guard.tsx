'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  ROUTES,
  isBuyerProtectedRoute,
  isSellerProtectedRoute,
  isSellerRoute,
} from '@/lib/routes'

/**
 * Client-side guard for protected buyer and seller routes.
 * Mirrors middleware checks — handles refresh, expired sessions, and logout.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const isProtected =
    isBuyerProtectedRoute(pathname) || isSellerProtectedRoute(pathname)

  const loginPath = isSellerRoute(pathname)
    ? ROUTES.seller.login
    : ROUTES.auth.login

  useEffect(() => {
    if (status === 'unauthenticated' && isProtected) {
      router.replace(loginPath)
    }
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

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (
    isSellerProtectedRoute(pathname) &&
    session?.user?.role !== 'SELLER'
  ) {
    return null
  }

  return <>{children}</>
}
