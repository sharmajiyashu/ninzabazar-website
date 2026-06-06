'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Order } from '@/app/types/type'
import axios from 'axios'
import { toast } from 'sonner'

interface CancelOrderDialogProps {
  order: Order
  trigger?: React.ReactNode // Optional custom trigger, default to button
}

const CancelOrderDialog = ({ order, trigger }: CancelOrderDialogProps) => {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCancelOrder = async () => {
    try {
      setLoading(true)
      await axios.put('/api/seller-order/cancel-order', {
        orderId: order.id,
        reason,
      })
      toast.success('Order cancelled successfully.')
      setOpen(false)
    } catch (error) {
      console.log(error)
      toast.error('Failed to cancel order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 w-full text-left"
          >
            Cancel Order
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Cancel Order #{order.id.slice(-8).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling this order.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional reason (visible to admin)"
        />

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelOrder}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Confirm Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CancelOrderDialog
