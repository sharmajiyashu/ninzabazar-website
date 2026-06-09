'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getPostLoginPath, isUserRole } from '@/lib/auth-config'

/**
 * Redirect authenticated users away from login/signup pages.
 * Complements middleware — prevents flash of login form on refresh.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    const role = session?.user?.role
    if (status === 'authenticated' && isUserRole(role)) {
      router.replace(getPostLoginPath(role))
      return
    }

    queueMicrotask(() => setReady(true))
  }, [status, session?.user?.role, router])

  if (status === 'loading' || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading...
      </div>
    )
  }

  return <>{children}</>
}
