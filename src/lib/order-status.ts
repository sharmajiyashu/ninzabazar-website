export const ORDER_STATUSES = {
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  ORDER_STATUSES.PROCESSING,
  ORDER_STATUSES.SHIPPED,
  ORDER_STATUSES.DELIVERED,
  ORDER_STATUSES.COMPLETED,
]

export function normalizeOrderStatus(status: string): OrderStatus {
  const upper = status.toUpperCase() as OrderStatus
  if (Object.values(ORDER_STATUSES).includes(upper)) {
    return upper
  }
  return ORDER_STATUSES.PROCESSING
}

export function getBuyerStatusLabel(status: string): string {
  switch (normalizeOrderStatus(status)) {
    case ORDER_STATUSES.PROCESSING:
      return 'Preparing Order'
    case ORDER_STATUSES.SHIPPED:
      return 'On the Way'
    case ORDER_STATUSES.DELIVERED:
      return 'Delivered'
    case ORDER_STATUSES.COMPLETED:
      return 'Completed'
    case ORDER_STATUSES.CANCELLED:
      return 'Cancelled'
    default:
      return status
  }
}

export function getSellerStatusLabel(status: string): string {
  switch (normalizeOrderStatus(status)) {
    case ORDER_STATUSES.PROCESSING:
      return 'Processing'
    case ORDER_STATUSES.SHIPPED:
      return 'Shipped'
    case ORDER_STATUSES.DELIVERED:
      return 'Delivered'
    case ORDER_STATUSES.COMPLETED:
      return 'Completed'
    case ORDER_STATUSES.CANCELLED:
      return 'Cancelled'
    default:
      return status
  }
}

export function getStatusStyles(status: string): string {
  switch (normalizeOrderStatus(status)) {
    case ORDER_STATUSES.PROCESSING:
      return 'bg-blue-50 text-blue-700 border border-blue-200'
    case ORDER_STATUSES.SHIPPED:
      return 'bg-amber-50 text-amber-700 border border-amber-200'
    case ORDER_STATUSES.DELIVERED:
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    case ORDER_STATUSES.COMPLETED:
      return 'bg-green-50 text-green-700 border border-green-200'
    case ORDER_STATUSES.CANCELLED:
      return 'bg-red-50 text-red-700 border border-red-200'
    default:
      return 'bg-gray-50 text-gray-600 border border-gray-200'
  }
}

export function canBuyerConfirmReceipt(status: string): boolean {
  return normalizeOrderStatus(status) === ORDER_STATUSES.SHIPPED
}

export function canBuyerLeaveReview(status: string): boolean {
  const s = normalizeOrderStatus(status)
  return s === ORDER_STATUSES.DELIVERED || s === ORDER_STATUSES.COMPLETED
}

export function canSellerShip(status: string): boolean {
  return normalizeOrderStatus(status) === ORDER_STATUSES.PROCESSING
}

export function canSellerCancel(status: string): boolean {
  return normalizeOrderStatus(status) === ORDER_STATUSES.PROCESSING
}

export function canSellerMarkDelivered(status: string): boolean {
  return normalizeOrderStatus(status) === ORDER_STATUSES.SHIPPED
}

export function canSellerMarkCompleted(status: string): boolean {
  return normalizeOrderStatus(status) === ORDER_STATUSES.DELIVERED
}

export function isValidSellerStatusTransition(
  from: string,
  to: string
): boolean {
  const current = normalizeOrderStatus(from)
  const next = normalizeOrderStatus(to)

  const allowed: Record<OrderStatus, OrderStatus[]> = {
    [ORDER_STATUSES.PROCESSING]: [ORDER_STATUSES.SHIPPED],
    [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.DELIVERED],
    [ORDER_STATUSES.DELIVERED]: [ORDER_STATUSES.COMPLETED],
    [ORDER_STATUSES.COMPLETED]: [],
    [ORDER_STATUSES.CANCELLED]: [],
  }

  return allowed[current]?.includes(next) ?? false
}

export type SellerStatusAction = {
  action: 'ship' | 'deliver' | 'complete'
  targetStatus: OrderStatus
  title: string
  description: string
  requiresTracking: boolean
  buttonLabel: string
}

export function getSellerStatusAction(
  status: string
): SellerStatusAction | null {
  switch (normalizeOrderStatus(status)) {
    case ORDER_STATUSES.PROCESSING:
      return {
        action: 'ship',
        targetStatus: ORDER_STATUSES.SHIPPED,
        title: 'Mark as Shipped',
        description: 'Add a tracking link so the buyer can follow the shipment.',
        requiresTracking: true,
        buttonLabel: 'Confirm Shipment',
      }
    case ORDER_STATUSES.SHIPPED:
      return {
        action: 'deliver',
        targetStatus: ORDER_STATUSES.DELIVERED,
        title: 'Mark as Delivered',
        description:
          'Confirm the order was delivered. Payment will be released to your wallet.',
        requiresTracking: false,
        buttonLabel: 'Confirm Delivered',
      }
    case ORDER_STATUSES.DELIVERED:
      return {
        action: 'complete',
        targetStatus: ORDER_STATUSES.COMPLETED,
        title: 'Mark as Completed',
        description: 'Close this order after delivery has been verified.',
        requiresTracking: false,
        buttonLabel: 'Mark Completed',
      }
    default:
      return null
  }
}

export function getTimelineStepState(
  step: OrderStatus,
  current: string
): 'complete' | 'current' | 'upcoming' | 'cancelled' {
  const currentStatus = normalizeOrderStatus(current)

  if (currentStatus === ORDER_STATUSES.CANCELLED) {
    return step === ORDER_STATUSES.PROCESSING ? 'cancelled' : 'upcoming'
  }

  const stepIndex = ORDER_STATUS_FLOW.indexOf(step)
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus)

  if (currentIndex === -1) return 'upcoming'
  if (stepIndex < currentIndex) return 'complete'
  if (stepIndex === currentIndex) return 'current'
  return 'upcoming'
}

export type BuyerOrderFilter =
  | 'allOrders'
  | 'toShipOrders'
  | 'toReceiveOrders'
  | 'completedOrders'
  | 'cancelledOrders'

export function matchesBuyerOrderFilter(
  status: string,
  filter: BuyerOrderFilter | string
): boolean {
  const s = normalizeOrderStatus(status)

  switch (filter) {
    case 'allOrders':
      return true
    case 'toShipOrders':
      return s === ORDER_STATUSES.PROCESSING
    case 'toReceiveOrders':
      return s === ORDER_STATUSES.SHIPPED
    case 'completedOrders':
      return s === ORDER_STATUSES.DELIVERED || s === ORDER_STATUSES.COMPLETED
    case 'cancelledOrders':
      return s === ORDER_STATUSES.CANCELLED
    default:
      return true
  }
}
