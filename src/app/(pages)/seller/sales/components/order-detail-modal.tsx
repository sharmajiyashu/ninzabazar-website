import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Order } from '@/app/types/type'
import CurrencyFormatter from '@/app/components/ui-utils/currency-format'

export const OrderDetailsModal = ({
  open,
  onOpenChange,
  order,
}: {
  open: boolean
  onOpenChange: (value: boolean) => void
  order: Order
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order ID: {order.id.slice(-8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>

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
            <strong>Shipping Address:</strong> {order.shippingAddress?.street},{' '}
            {order.shippingAddress?.city}, {order.shippingAddress?.state},{' '}
            {order.shippingAddress?.postalCode}
          </div>

          <hr />

          <div className="text-sm font-semibold">Items:</div>
          {order.orderItems.map((item) => {
            const price = item.priceAtPurchase
            return (
              <div
                key={item.id}
                className="flex justify-between border-b py-1 text-sm"
              >
                <span>{item.product.name}</span>
                {item.variant && (
                  <span>
                    {item.variant?.title}: {item.variant?.option}
                  </span>
                )}
                <span>
                  x{item.quantity} —{' '}
                  <CurrencyFormatter amount={Number(price) || 0} />
                </span>
              </div>
            )
          })}

          <div className="flex flex-col items-end space-y-2">
            <span>
              Shipping fee:{' '}
              <CurrencyFormatter
                amount={order.orderItems.reduce(
                  (sum, item) => sum + (item.shippingMethodPrice || 0),
                  0
                )}
              />
            </span>
            <strong>
              Total: <CurrencyFormatter amount={order.sellerTotal} />
            </strong>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OrderDetailsModal
