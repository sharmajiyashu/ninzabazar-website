import { ROUTES } from './paths'

export type ProductsQuery = {
  category?: string
  subCategory?: string
  query?: string
}

/** Build `/products?…` search/filter URL. */
export function productsPath(params?: ProductsQuery): string {
  if (!params) return ROUTES.products
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (params.subCategory) search.set('subCategory', params.subCategory)
  if (params.query) search.set('query', params.query)
  const qs = search.toString()
  return qs ? `${ROUTES.products}?${qs}` : ROUTES.products
}

export type NewMessageParams = {
  sellerId: string
  productId: string
  productName: string
  productImage?: string
  storeName?: string
}

/** Existing conversation deep-link. */
export function messagesConversationPath(conversationId: string): string {
  return `${ROUTES.buyer.messages}?xcnv=${encodeURIComponent(conversationId)}`
}

/** New seller conversation deep-link. */
export function messagesNewSellerPath(params: NewMessageParams): string {
  const search = new URLSearchParams({
    sellerId: params.sellerId,
    productId: params.productId,
    productName: params.productName,
  })
  if (params.productImage) search.set('productImage', params.productImage)
  if (params.storeName) search.set('storeName', params.storeName)
  return `${ROUTES.buyer.messages}?${search.toString()}`
}

/** Email verification API path (pathname + query only). */
export function verifyEmailApiPath(token: string, email: string): string {
  return `/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
}

export function verifyEmailRefreshPath(): string {
  return `${ROUTES.auth.verifyEmail}?refresh=true`
}

export function verificationFailedPath(error: string): string {
  return `${ROUTES.auth.verificationFailed}?error=${encodeURIComponent(error)}`
}

export function verificationSuccessPath(refresh = true): string {
  return refresh
    ? `${ROUTES.auth.verificationSuccess}?refresh=true`
    : ROUTES.auth.verificationSuccess
}
