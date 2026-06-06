'use client'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface OrderItem {
  orderId: string
  orderTitle: string
  orderQty: number
  orderPrice: number
  statusType: string
  orderDetails: string
}

interface OrderDetailsModalProps {
  open: boolean
  onClose: () => void
  orderItem: OrderItem
  getBuyerLabel: (statusType: string) => string
}

export const OrderDetailsModal = ({
  open,
  onClose,
  orderItem,
  getBuyerLabel,
}: OrderDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className="bg-green text-white text-center py-4 rounded-t-xl">
          <DialogTitle className="text-xl">Your Order is Completed</DialogTitle>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Order ID:</span>
            <span>{orderItem.orderId}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Product:</span>
            <span>{orderItem.orderTitle}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Quantity:</span>
            <span>{orderItem.orderQty}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Price:</span>
            <span>${orderItem.orderPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Status:</span>
            <span>{getBuyerLabel(orderItem.statusType)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Order Date:</span>
            <span>{orderItem.orderDetails}</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="rounded-full bg-green">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
