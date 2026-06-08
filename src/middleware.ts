import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import {
  ROUTES,
  SELLER_PENDING_ALLOWED,
  isPublicPath,
  isEmailVerifyPath,
  isSellerProtectedRoute,
  isBuyerProtectedRoute,
  matchesPath,
  redirectPath,
} from '@/lib/routes'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (
    pathname.startsWith('/api/socket/io') &&
    req.headers.get('upgrade') === 'websocket'
  ) {
    return NextResponse.next()
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // ── Buyer login: redirect authenticated users ──────────────────────────────
  if (matchesPath(pathname, ROUTES.auth.login) && token) {
    if (token.role === 'SELLER') {
      return NextResponse.redirect(redirectPath(ROUTES.seller.dashboard, req))
    }
    return NextResponse.redirect(redirectPath(ROUTES.home, req))
  }

  // ── Buyer protected routes ───────────────────────────────────────────────────
  if (isBuyerProtectedRoute(pathname) && !token) {
    return NextResponse.redirect(redirectPath(ROUTES.auth.login, req))
  }

  // ── Seller login: redirect authenticated sellers ───────────────────────────
  if (token?.role === 'SELLER' && matchesPath(pathname, ROUTES.seller.login)) {
    return NextResponse.redirect(redirectPath(ROUTES.seller.dashboard, req))
  }

  // ── Seller on buyer home → seller dashboard (skip if pending approval) ─────
  if (
    token?.role === 'SELLER' &&
    matchesPath(pathname, ROUTES.home) &&
    token.storeStatus !== 'pending'
  ) {
    return NextResponse.redirect(redirectPath(ROUTES.seller.dashboard, req))
  }

  // ── Buyer email verification ─────────────────────────────────────────────────
  if (token?.role === 'BUYER') {
    const isVerified = token.emailVerified === true

    if (!isVerified && !isEmailVerifyPath(pathname) && !isPublicPath(pathname)) {
      return NextResponse.redirect(
        redirectPath(`${ROUTES.auth.verifyEmail}?refresh=true`, req)
      )
    }

    if (isVerified && matchesPath(pathname, ROUTES.auth.verifyEmail)) {
      return NextResponse.redirect(redirectPath(ROUTES.home, req))
    }
  }

  if (
    matchesPath(pathname, ROUTES.auth.verifyEmail) &&
    token?.role === 'BUYER' &&
    token.emailVerified === true
  ) {
    return NextResponse.redirect(redirectPath(ROUTES.home, req))
  }

  // ── Seller protected routes ──────────────────────────────────────────────────
  if (isSellerProtectedRoute(pathname)) {
    if (!token) {
      return NextResponse.redirect(redirectPath(ROUTES.seller.login, req))
    }
    if (token.role !== 'SELLER') {
      return NextResponse.redirect(redirectPath(ROUTES.auth.login, req))
    }
  }

  // ── Pending seller: restrict to allowed paths ────────────────────────────────
  if (
    token?.role === 'SELLER' &&
    token.storeStatus === 'pending' &&
    !SELLER_PENDING_ALLOWED.some((allowed) => matchesPath(pathname, allowed))
  ) {
    return NextResponse.redirect(redirectPath(ROUTES.seller.pending, req))
  }

  return NextResponse.next()
}

export const config = {
  // Must be a static literal — Next.js does not support imported matcher arrays
  matcher: [
    '/',
    '/login',
    '/signup',
    '/verify-email',
    '/verification-success',
    '/verification-failed',
    '/account',
    '/cart',
    '/checkout',
    '/orders',
    '/messages',
    '/seller/:path*',
  ],
}
