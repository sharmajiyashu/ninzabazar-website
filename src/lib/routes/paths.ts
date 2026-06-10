/**
 * Central route path constants.
 * All navigation must use these — never hardcode path strings in components.
 */

export const ROUTES = {
  home: '/',
  products: '/products',
  about: '/about',
  careers: '/careers',
  landingPage: '/landing-page',
  notFound: '/not-found',

  auth: {
    login: '/login',
    signup: '/signup',
    verifyEmail: '/verify-email',
    verificationSuccess: '/verification-success',
    verificationFailed: '/verification-failed',
  },

  buyer: {
    cart: '/cart',
    checkout: '/checkout',
    success: '/success',
    account: '/account',
    accountDashboard: '/account/dashboard',
    orders: '/orders',
    messages: '/messages',
  },

  seller: {
    root: '/seller',
    login: '/seller/login',
    signup: '/seller/signup',
    dashboard: '/seller/dashboard',
    /** @deprecated Use dashboard — kept for backwards compatibility */
    home: '/seller/home',
    products: '/seller/products',
    post: '/seller/post',
    sales: '/seller/sales',
    orders: '/seller/sales',
    payment: '/seller/payment',
    messages: '/seller/messages',
    registration: '/seller/registration',
    registrationSubmit: '/seller/registration/submit',
    pending: '/seller/pending',
    approved: '/seller/approved',
    success: '/seller/success',
  },

  legal: {
    privacy: '/privacy',
    terms: '/terms',
  },
} as const

/** Ensure path starts with `/`. */
export function normalizePath(path: string): string {
  if (!path) return ROUTES.home
  return path.startsWith('/') ? path : `/${path}`
}

export function productPath(id: string): string {
  return `/product/${id}`
}

export function storePath(userId: string): string {
  return `/store/${userId}`
}

export function storeCompanyPath(userId: string): string {
  return `/store/${userId}/company`
}

export function sellerPostEditPath(productId: string): string {
  return `${ROUTES.seller.post}?edit=${encodeURIComponent(productId)}`
}
