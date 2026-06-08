import type { NextRequest } from 'next/server'

/** Normalize an app path (always starts with /). */
export function appPath(path: string): string {
  if (!path) return '/'
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Origin from the current request.
 * Local: http://localhost:3000 (host header includes port)
 * Live: https://your-domain.com
 */
export function requestOrigin(req: Request | NextRequest): string {
  const url = new URL(req.url)
  const host =
    req.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    req.headers.get('host') ||
    url.host
  const proto =
    req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    url.protocol.replace(':', '')

  return `${proto}://${host}`
}

/** Absolute URL for emails/links — built from the incoming request origin. */
export function absoluteUrl(path: string, req: Request | NextRequest): string {
  return new URL(appPath(path), requestOrigin(req)).toString()
}

/** Redirect using the same origin as the current request (path + port / live domain). */
export function redirectTo(path: string, req: Request | NextRequest): URL {
  return new URL(appPath(path), req.url)
}

/** Fallback when no request exists (local scripts only). */
export function localOrigin(): string {
  return `http://localhost:${process.env.PORT || '3000'}`
}

/**
 * NextAuth requires NEXTAUTH_URL internally for cookies/callbacks.
 * Auto-set from localhost (with port) or Vercel — no manual .env needed.
 */
export function initAuthUrl(): void {
  if (process.env.NEXTAUTH_URL) return

  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
    return
  }

  process.env.NEXTAUTH_URL = localOrigin()
}

export function useSecureAuthCookies(req?: Request | NextRequest): boolean {
  initAuthUrl()
  if (req) {
    return requestOrigin(req).startsWith('https://')
  }
  return process.env.NEXTAUTH_URL?.startsWith('https://') ?? false
}
