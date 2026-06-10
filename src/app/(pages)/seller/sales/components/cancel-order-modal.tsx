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
import { useQueryClient } from '@tanstack/react-query'

interface CancelOrderDialogProps {
  order: Order
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

const CancelOrderDialog = ({
  order,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: CancelOrderDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = controlledOnOpenChange ?? setInternalOpen
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleCancelOrder = async () => {
    try {
      setLoading(true)
      await axios.put('/api/seller-order/cancel-order', {
        orderId: order.id,
        reason,
      })
      toast.success('Order cancelled successfully.')
      await queryClient.invalidateQueries({ queryKey: ['seller-orders'] })
      await queryClient.invalidateQueries({ queryKey: ['seller-order-stats'] })
      onSuccess?.()
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
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

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
