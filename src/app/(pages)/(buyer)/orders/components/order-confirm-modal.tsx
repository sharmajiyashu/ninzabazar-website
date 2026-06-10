'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ConfirmReceiptModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmReceiptModal = ({
  open,
  onClose,
  onConfirm,
}: ConfirmReceiptModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirmReceipt = async () => {
    try {
      setIsSubmitting(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.log('Error confirming receipt:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Receipt</DialogTitle>
        </DialogHeader>
        <p>Are you sure you&apos;ve received this item?</p>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReceipt}
            className="rounded-full bg-green hover:bg-transparent hover:text-green border-green"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
