import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { initAuthUrl, redirectTo, requestOrigin } from '@/lib/app-url'

initAuthUrl()

/** Paths anyone can visit without logging in */
const PUBLIC_PATHS = [
  '/',
  '/products',
  '/about',
  '/landing-page',
  '/login',
  '/signup',
  '/cart',
  '/careers',
]

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (pathname.startsWith('/product/')) return true
  if (pathname.startsWith('/store/')) return true
  return false
}

export async function middleware(req: NextRequest) {
  // Keep NextAuth URL aligned with the current host (localhost:port or live domain)
  process.env.NEXTAUTH_URL = requestOrigin(req)

  const pathname = req.nextUrl.pathname
  const url = req.nextUrl.clone()

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

  const homepage = '/'
  const userSignInPath = '/login'
  const buyerMessages = '/messages'
  const sellerPath = '/seller'
  const sellerSignInPath = '/seller/login'
  const sellerSignupPath = '/seller/signup'
  const sellerProfilePath = /^\/seller-profile\/[^\/]+$/
  const emailVerifyPath = '/verify-email'

  const publicSellerPaths = [
    sellerSignInPath,
    sellerSignupPath,
    sellerProfilePath,
  ]

  const isPublicSellerPath = publicSellerPaths.some((path) =>
    typeof path === 'string' ? path === pathname : path.test(pathname)
  )

  const isVerifyEmailPage =
    pathname === '/verify-email' ||
    pathname === '/verification-success' ||
    pathname === '/verification-failed'

  if (pathname === userSignInPath && token) {
    url.pathname = homepage
    return NextResponse.redirect(url)
  }

  if (pathname === buyerMessages && !token) {
    url.pathname = userSignInPath
    return NextResponse.redirect(url)
  }

  if (token?.role === 'SELLER' && pathname === sellerSignInPath) {
    return NextResponse.redirect(redirectTo('/seller/dashboard', req))
  }

  // Buyers can browse public pages before email verification
  if (token?.role === 'BUYER') {
    const isVerified = token.emailVerified === true

    if (!isVerified && !isVerifyEmailPage && !isPublicPath(pathname)) {
      return NextResponse.redirect(
        new URL(`${emailVerifyPath}?refresh=true`, req.url)
      )
    }

    if (isVerified && pathname === '/verify-email') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (
    pathname === emailVerifyPath &&
    token?.role === 'BUYER' &&
    token?.emailVerified === true
  ) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith(sellerPath) && !isPublicSellerPath) {
    if (!token) {
      return NextResponse.redirect(redirectTo(sellerSignInPath, req))
    }
    if (token.role !== 'SELLER') {
      return NextResponse.redirect(redirectTo(userSignInPath, req))
    }
  }

  const sellerPathsWhenPending = [
    '/seller/pending',
    '/seller/registration',
    homepage,
  ]

  if (
    token?.role === 'SELLER' &&
    token?.storeStatus === 'pending' &&
    !sellerPathsWhenPending.includes(pathname)
  ) {
    return NextResponse.redirect(redirectTo('/seller/pending', req))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/messages',
    '/verify-email',
    '/verification-success',
    '/verification-failed',
    '/seller/:path*',
  ],
}
