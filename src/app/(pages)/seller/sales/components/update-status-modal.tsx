'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Order } from '@/app/types/type'
import { ORDER_STATUSES } from '@/lib/order-status'
import { toast } from 'sonner'

export default function UpdateStatusModal({
  open,
  onOpenChange,
  order,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}) {
  const [trackingLink, setTrackingLink] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)

      await axios.put('/api/seller-order/put-tracking-link', {
        orderId: order.id,
        status: ORDER_STATUSES.SHIPPED,
        trackingLink,
      })

      toast.success('Order marked as shipped')
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Shipped</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            value={trackingLink}
            onChange={(e) => setTrackingLink(e.target.value)}
            placeholder="Enter tracking link/code"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !trackingLink}
            className="bg-orange text-white hover:bg-orange-600"
          >
            {loading ? 'Updating...' : 'Submit Tracking Info'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
