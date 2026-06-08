import type { NextRequest } from 'next/server'
import { normalizePath } from './paths'

/**
 * Build a redirect URL from a pathname and the current request.
 * Uses the request URL as base — no env vars, no hostname parsing.
 * Works identically on localhost and production.
 */
export function redirectPath(path: string, req: Request | NextRequest): URL {
  return new URL(normalizePath(path), req.url)
}

/**
 * Full URL for outbound email links — derived from the incoming request, not environment.
 */
export function requestPathUrl(path: string, req: Request | NextRequest): string {
  return redirectPath(path, req).toString()
}
