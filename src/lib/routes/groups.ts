import { ROUTES, normalizePath, productPath, storePath } from './paths'

/** Routes with no auth shell — login/signup pages only. */
export const AUTH_ROUTES: readonly string[] = [
  ROUTES.auth.login,
  ROUTES.auth.signup,
  ROUTES.seller.login,
  ROUTES.seller.signup,
]

/** Buyer routes that require a session (middleware-enforced). */
export const BUYER_PROTECTED_ROUTES: readonly string[] = [
  ROUTES.buyer.account,
  ROUTES.buyer.checkout,
  ROUTES.buyer.orders,
  ROUTES.buyer.messages,
]

/** Seller routes accessible without authentication. */
export const SELLER_PUBLIC_ROUTES: readonly string[] = [
  ROUTES.seller.login,
  ROUTES.seller.signup,
]

/** Seller routes allowed while store status is pending. */
export const SELLER_PENDING_ALLOWED: readonly string[] = [
  ROUTES.home,
  ROUTES.seller.pending,
  ROUTES.seller.registration,
  ROUTES.seller.registrationSubmit,
]

/** Public buyer routes (no email verification required). */
export const PUBLIC_PATHS: readonly string[] = [
  ROUTES.home,
  ROUTES.products,
  ROUTES.about,
  ROUTES.landingPage,
  ROUTES.auth.login,
  ROUTES.auth.signup,
  ROUTES.buyer.cart,
  ROUTES.careers,
  ROUTES.auth.verifyEmail,
  ROUTES.auth.verificationSuccess,
  ROUTES.auth.verificationFailed,
]

export const EMAIL_VERIFY_PATHS: readonly string[] = [
  ROUTES.auth.verifyEmail,
  ROUTES.auth.verificationSuccess,
  ROUTES.auth.verificationFailed,
]

/** Middleware matcher — single source of truth. */
export const MIDDLEWARE_MATCHER: string[] = [
  ROUTES.home,
  ROUTES.auth.login,
  ROUTES.auth.signup,
  ROUTES.auth.verifyEmail,
  ROUTES.auth.verificationSuccess,
  ROUTES.auth.verificationFailed,
  ROUTES.buyer.account,
  `${ROUTES.buyer.account}/:path*`,
  ROUTES.buyer.cart,
  ROUTES.buyer.checkout,
  ROUTES.buyer.orders,
  ROUTES.buyer.messages,
  `${ROUTES.seller.root}/:path*`,
]

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(normalizePath(pathname))
}

export function isSellerRoute(pathname: string): boolean {
  const path = normalizePath(pathname)
  return path.startsWith(`${ROUTES.seller.root}/`) || path === ROUTES.seller.root
}

export function isSellerProtectedRoute(pathname: string): boolean {
  return isSellerRoute(pathname) && !SELLER_PUBLIC_ROUTES.includes(normalizePath(pathname))
}

export function isPublicPath(pathname: string): boolean {
  const path = normalizePath(pathname)
  if (PUBLIC_PATHS.includes(path)) return true
  if (path.startsWith('/product/')) return true
  if (path.startsWith('/store/')) return true
  return false
}

export function isEmailVerifyPath(pathname: string): boolean {
  return EMAIL_VERIFY_PATHS.includes(normalizePath(pathname))
}

export function isBuyerProtectedRoute(pathname: string): boolean {
  const path = normalizePath(pathname)
  if (path === ROUTES.buyer.account || path.startsWith(`${ROUTES.buyer.account}/`)) {
    return true
  }
  return BUYER_PROTECTED_ROUTES.includes(path)
}

export function matchesPath(pathname: string, route: string): boolean {
  return normalizePath(pathname) === normalizePath(route)
}

/** Where to send an authenticated user who hits login/signup pages. */
export function getAuthenticatedAuthRedirect(
  pathname: string,
  role: string | undefined
): string | null {
  if (!role) return null

  const path = normalizePath(pathname)
  const isBuyerAuth =
    path === normalizePath(ROUTES.auth.login) ||
    path === normalizePath(ROUTES.auth.signup)
  const isSellerAuth =
    path === normalizePath(ROUTES.seller.login) ||
    path === normalizePath(ROUTES.seller.signup)

  if (!isBuyerAuth && !isSellerAuth) return null

  if (role === 'SELLER') return ROUTES.seller.dashboard
  if (role === 'BUYER') return ROUTES.home

  return null
}

export { productPath, storePath }
