import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Order } from '@/app/types/type'
import CurrencyFormatter from '@/app/components/ui-utils/currency-format'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { OrderStatusTimeline } from '@/components/order-status-timeline'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { ORDER_STATUSES, getSellerStatusAction, normalizeOrderStatus } from '@/lib/order-status'

export const OrderDetailsModal = ({
  open,
  onOpenChange,
  order,
}: {
  open: boolean
  onOpenChange: (value: boolean) => void
  order: Order
}) => {
  const trackingLink = order.trackingLink
  const nextAction = getSellerStatusAction(order.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription className="font-mono">
                #{order.id.slice(-8).toUpperCase()} ·{' '}
                {format(new Date(order.createdAt), 'PPP')}
              </DialogDescription>
            </div>
            <OrderStatusBadge status={order.status} variant="seller" />
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Order Status
          </p>
          <OrderStatusTimeline status={order.status} variant="seller" />
          {nextAction && (
            <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
              Next step: {nextAction.title}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <strong>Buyer:</strong> {order.buyer.user.firstName}{' '}
            {order.buyer.user.lastName}
          </div>
          <div>
            <strong>Email:</strong> {order.buyer.user.email}
          </div>
          <div>
            <strong>Contact:</strong> {order.buyer.user.contactNumber}
          </div>
          <div>
            <strong>Shipping Address:</strong>{' '}
            {order.shippingAddress
              ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`
              : 'Not provided'}
          </div>

          {trackingLink &&
            normalizeOrderStatus(order.status) !== ORDER_STATUSES.PROCESSING && (
              <div className="flex items-center gap-2">
                <strong>Tracking:</strong>
                <a
                  href={trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#006d44] hover:underline inline-flex items-center gap-1"
                >
                  {trackingLink.length > 40
                    ? `${trackingLink.slice(0, 40)}...`
                    : trackingLink}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
        </div>

        <div className="border-t pt-3">
          <div className="text-sm font-semibold mb-2">Items</div>
          {order.orderItems.map((item) => {
            const price = item.priceAtPurchase
            return (
              <div
                key={item.id}
                className="flex justify-between border-b py-2 text-sm gap-2"
              >
                <div className="min-w-0">
                  <span className="font-medium">{item.product.name}</span>
                  {item.variant && (
                    <p className="text-xs text-gray-500">
                      {item.variant.title}: {item.variant.option}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-right">
                  x{item.quantity} —{' '}
                  <CurrencyFormatter amount={Number(price) || 0} />
                </span>
              </div>
            )
          })}

          <div className="flex flex-col items-end space-y-1 mt-3 text-sm">
            <span>
              Shipping fee:{' '}
              <CurrencyFormatter
                amount={order.orderItems.reduce(
                  (sum, item) => sum + (item.shippingMethodPrice || 0),
                  0
                )}
              />
            </span>
            <strong className="text-base">
              Total: <CurrencyFormatter amount={order.sellerTotal} />
            </strong>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OrderDetailsModal
