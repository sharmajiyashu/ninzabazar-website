'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Order } from '@/app/types/type'
import { getSellerStatusAction } from '@/lib/order-status'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export default function UpdateStatusModal({
  open,
  onOpenChange,
  order,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  onSuccess?: () => void
}) {
  const [trackingLink, setTrackingLink] = useState(order.trackingLink || '')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const statusAction = getSellerStatusAction(order.status)

  useEffect(() => {
    if (open) {
      setTrackingLink(order.trackingLink || '')
    }
  }, [open, order.trackingLink])

  if (!statusAction) {
    return null
  }

  const handleSubmit = async () => {
    if (statusAction.requiresTracking && !trackingLink.trim()) {
      toast.error('Please enter a tracking link')
      return
    }

    try {
      setLoading(true)

      await axios.put('/api/seller-order/update-status', {
        orderId: order.id,
        status: statusAction.targetStatus,
        trackingLink: statusAction.requiresTracking ? trackingLink.trim() : undefined,
      })

      const messages: Record<string, string> = {
        ship: 'Order marked as shipped',
        deliver: 'Order marked as delivered. Payment released.',
        complete: 'Order marked as completed',
      }

      toast.success(messages[statusAction.action])
      await queryClient.invalidateQueries({ queryKey: ['seller-orders'] })
      await queryClient.invalidateQueries({ queryKey: ['seller-order-stats'] })
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update order status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{statusAction.title}</DialogTitle>
          <DialogDescription>{statusAction.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {statusAction.requiresTracking && (
            <Input
              value={trackingLink}
              onChange={(e) => setTrackingLink(e.target.value)}
              placeholder="Enter tracking link or code"
            />
          )}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                (statusAction.requiresTracking && !trackingLink.trim())
              }
              className="bg-[#006d44] text-white hover:bg-[#005a36]"
            >
              {loading ? 'Updating...' : statusAction.buttonLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
