'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getPostLoginPath, isUserRole } from '@/lib/auth-config'

/**
 * Redirect authenticated users away from login/signup pages.
 * Shows the form while session is loading — avoids stuck Loading on Vercel.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession()
  const router = useRouter()
  const redirected = useRef(false)

  useEffect(() => {
    redirected.current = false
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated' || redirected.current) return

    const role = session?.user?.role
    if (isUserRole(role)) {
      redirected.current = true
      router.replace(getPostLoginPath(role))
    }
  }, [status, session?.user?.role, router])

  return <>{children}</>
}
