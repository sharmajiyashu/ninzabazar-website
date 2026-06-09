import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { ROUTES } from '@/lib/routes'

export type UserRole = 'BUYER' | 'SELLER'

/** Single secret used by NextAuth and middleware — must match on every environment. */
export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET environment variable is required')
  }
  return secret
}

/**
 * Cookie security flag shared by NextAuth and middleware getToken().
 * CRITICAL: both must use the same value or sessions appear missing in middleware.
 */
export function shouldUseSecureCookies(): boolean {
  if (process.env.VERCEL) return true
  const url = process.env.NEXTAUTH_URL ?? ''
  return url.startsWith('https://')
}

/**
 * NextAuth reads NEXTAUTH_URL when issuing session cookies.
 * Sync from the incoming request when unset or still pointing at localhost.
 */
export function syncNextAuthUrlFromRequest(req: Request | NextRequest): void {
  const current = process.env.NEXTAUTH_URL?.replace(/\/$/, '')
  const isLocal =
    !current ||
    current.includes('localhost') ||
    current.includes('127.0.0.1')

  if (current?.startsWith('https://') && !isLocal) return

  const url = new URL(req.url)
  const host =
    req.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    req.headers.get('host') ||
    url.host
  const proto =
    req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    url.protocol.replace(':', '')

  process.env.NEXTAUTH_URL = `${proto}://${host}`
}

/** Read JWT session in middleware with the same cookie settings as NextAuth. */
export async function readSessionToken(req: NextRequest) {
  return getToken({
    req,
    secret: getAuthSecret(),
    secureCookie: shouldUseSecureCookies(),
  })
}

/** Default landing path after successful login. */
export function getPostLoginPath(role: UserRole): string {
  return role === 'SELLER' ? ROUTES.seller.dashboard : ROUTES.home
}

/** Login page for each role. */
export function getLoginPath(role: UserRole): string {
  return role === 'SELLER' ? ROUTES.seller.login : ROUTES.auth.login
}

export function isUserRole(value: unknown): value is UserRole {
  return value === 'BUYER' || value === 'SELLER'
}

/** Dev / Vercel debugging — set AUTH_DEBUG=true in environment. */
export function authDebug(label: string, data: Record<string, unknown>): void {
  if (process.env.AUTH_DEBUG !== 'true') return
  console.log(`[auth:${label}]`, JSON.stringify(data))
}
