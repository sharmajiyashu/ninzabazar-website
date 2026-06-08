'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROUTES, isAuthRoute, isSellerRoute } from '@/lib/routes'

/**
 * Client guard for seller dashboard routes.
 * Redirects to /seller/login when session is cleared (e.g. after logout).
 */
export function SellerRouteGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const isProtectedSellerPage =
    isSellerRoute(pathname) && !isAuthRoute(pathname)

  useEffect(() => {
    if (status === 'unauthenticated' && isProtectedSellerPage) {
      router.replace(ROUTES.seller.login)
    }
  }, [status, isProtectedSellerPage, router])

  if (!isProtectedSellerPage) {
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

  return <>{children}</>
}
