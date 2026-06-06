import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const url = req.nextUrl.clone()

  // Allow WebSocket upgrade requests
  if (
    pathname.startsWith('/api/socket/io') &&
    req.headers.get('upgrade') === 'websocket'
  ) {
    return NextResponse.next()
  }

  // Get JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Only log token details in development and for debugging specific issues
  if (process.env.NODE_ENV === 'development') {
    if (token) {
      console.log('🔐 Token details for verification:')
      console.log(' - id:', token.id)
      console.log(' - email:', token.email)
      console.log(' - emailVerified:', token.emailVerified)
      console.log(' - role:', token.role)
      console.log(' - store status:', token.storeStatus)
    } else {
      console.log('⚠️ No token available (unauthenticated user)')
    }
  }

  // Define paths
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

  // Prevent authenticated users from accessing login page
  if (pathname === userSignInPath && token) {
    url.pathname = homepage
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users away from protected buyer pages
  if (pathname === buyerMessages && !token) {
    url.pathname = userSignInPath
    return NextResponse.redirect(url)
  }

  // Redirect logged-in sellers trying to access login or homepage
  if (token?.role === 'SELLER') {
    if (pathname === sellerSignInPath || pathname === homepage) {
      url.pathname = '/seller/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Redirect buyer if not email verified
  if (token?.role === 'BUYER') {
    const isVerified = token.emailVerified === true

    const isVerifyEmailPage =
      pathname === '/verify-email' ||
      pathname === '/verification-success' ||
      pathname === '/verification-failed'

    if (!isVerified && !isVerifyEmailPage) {
      console.log('❌ Email not verified, redirecting to /verify-email')
      return NextResponse.redirect(
        new URL(`${emailVerifyPath}?refresh=true`, req.url)
      )
    }

    if (isVerified && pathname === '/verify-email') {
      console.log('✅ Already verified, redirecting to home')
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Prevent verified users from revisiting /verify-email
  if (
    pathname === emailVerifyPath &&
    token?.role === 'BUYER' &&
    token?.emailVerified === true
  ) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Protect /seller routes
  if (pathname.startsWith(sellerPath) && !isPublicSellerPath) {
    if (!token) {
      url.pathname = homepage
      return NextResponse.redirect(url)
    }
    if (token.role !== 'SELLER') {
      url.pathname = userSignInPath
      return NextResponse.redirect(url)
    }
  }

  // redirect to pending page status if seller is still on pending
  if (
    token?.role === 'SELLER' &&
    token?.storeStatus === 'pending' &&
    pathname !== '/seller/pending' // guard condition to prevent too many redirs
  ) {
    url.pathname = '/seller/pending'
    return NextResponse.redirect(new URL('/seller/pending', req.url))
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
