'use client'

import { Check, Circle, X } from 'lucide-react'
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUSES,
  getBuyerStatusLabel,
  getSellerStatusLabel,
  getTimelineStepState,
  normalizeOrderStatus,
} from '@/lib/order-status'

interface OrderStatusTimelineProps {
  status: string
  variant?: 'buyer' | 'seller'
}

export function OrderStatusTimeline({
  status,
  variant = 'buyer',
}: OrderStatusTimelineProps) {
  const normalized = normalizeOrderStatus(status)
  const isCancelled = normalized === ORDER_STATUSES.CANCELLED

  const getLabel = (step: (typeof ORDER_STATUS_FLOW)[number]) =>
    variant === 'seller' ? getSellerStatusLabel(step) : getBuyerStatusLabel(step)

  if (isCancelled) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        This order was cancelled.
      </div>
    )
  }

  return (
    <ol className="space-y-0">
      {ORDER_STATUS_FLOW.map((step, index) => {
        const state = getTimelineStepState(step, status)
        const isLast = index === ORDER_STATUS_FLOW.length - 1

        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  state === 'complete'
                    ? 'border-green-600 bg-green-600 text-white'
                    : state === 'current'
                      ? 'border-[#006d44] bg-[#006d44] text-white'
                      : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                {state === 'complete' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3 fill-current" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] ${
                    state === 'complete' ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
              <p
                className={`text-sm font-medium ${
                  state === 'current'
                    ? 'text-[#006d44]'
                    : state === 'complete'
                      ? 'text-gray-900'
                      : 'text-gray-400'
                }`}
              >
                {getLabel(step)}
              </p>
              {state === 'current' && (
                <p className="text-xs text-gray-500 mt-0.5">Current step</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function OrderStatusTimelineCompact({ status }: { status: string }) {
  if (normalizeOrderStatus(status) === ORDER_STATUSES.CANCELLED) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600">
        <X className="h-3 w-3" /> Cancelled
      </span>
    )
  }

  return <OrderStatusTimeline status={status} variant="buyer" />
}
