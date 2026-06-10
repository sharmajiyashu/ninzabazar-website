'use client'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { BuyerOrderSummary } from '@/app/types/type'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { OrderStatusTimeline } from '@/components/order-status-timeline'
import CurrencyFormatter from '@/app/components/ui-utils/currency-format'
import { format } from 'date-fns'

interface OrderDetailsModalProps {
  open: boolean
  onClose: () => void
  order: BuyerOrderSummary
}

export const OrderDetailsModal = ({
  open,
  onClose,
  order,
}: OrderDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <DialogTitle className="text-lg font-semibold">
              Order Details
            </DialogTitle>
            <p className="text-xs font-mono text-gray-500 mt-1">
              #{order.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Order Progress
          </p>
          <OrderStatusTimeline status={order.status} variant="buyer" />
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order date</span>
            <span className="text-gray-900">
              {format(new Date(order.createdAt), 'PPP')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Store</span>
            <span className="text-gray-900">{order.store.name}</span>
          </div>
          {order.trackingLink && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Tracking</span>
              <a
                href={order.trackingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#006d44] hover:underline inline-flex items-center gap-1"
              >
                View tracking <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          {order.shippingAddress && (
            <div className="text-sm">
              <span className="text-gray-500 block mb-1">Shipping address</span>
              <p className="text-gray-900">
                {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 border-t pt-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Items
          </p>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.name}
                  </p>
                  {item.variantTitle && (
                    <p className="text-xs text-gray-500">
                      {item.variantTitle}: {item.variantOption}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium shrink-0">
                  <CurrencyFormatter amount={item.price * item.quantity} />
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex justify-between items-center border-t pt-4">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-[#006d44]">
            <CurrencyFormatter amount={order.totalAmount} />
          </span>
        </div>

        <DialogFooter className="mt-2">
          <Button
            onClick={onClose}
            className="rounded-full bg-[#006d44] hover:bg-[#005a36] w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
