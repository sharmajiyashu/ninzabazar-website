import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

/** Read the current server session (API routes and server components). */
export function getSession() {
  return getServerSession(authOptions)
}

/** Require an authenticated session or return null. */
export async function requireSession() {
  const session = await getSession()
  if (!session?.user?.id) return null
  return session
}
