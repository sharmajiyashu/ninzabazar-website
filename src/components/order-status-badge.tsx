'use client'

import {
  getBuyerStatusLabel,
  getSellerStatusLabel,
  getStatusStyles,
  normalizeOrderStatus,
} from '@/lib/order-status'

interface OrderStatusBadgeProps {
  status: string
  variant?: 'buyer' | 'seller'
  className?: string
}

export function OrderStatusBadge({
  status,
  variant = 'buyer',
  className = '',
}: OrderStatusBadgeProps) {
  const label =
    variant === 'seller'
      ? getSellerStatusLabel(status)
      : getBuyerStatusLabel(status)

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(normalizeOrderStatus(status))} ${className}`}
    >
      {label}
    </span>
  )
}
