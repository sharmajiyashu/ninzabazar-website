'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import axios from 'axios'

interface AddReviewModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (reviewData: {
    id?: string
    rating: number
    title: string
    comment: string
  }) => Promise<void>
  productName?: string
  userId?: string
  productId?: string
}

export const AddReviewModal = ({
  open,
  onClose,
  onSubmit,
  productName,
  userId,
  productId,
}: AddReviewModalProps) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null)

  // Reset form when modal closes
  const resetForm = () => {
    setRating(0)
    setHoveredRating(0)
    setTitle('')
    setComment('')
    setExistingReviewId(null)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    if (!title.trim()) {
      alert('Please enter a review title')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        id: existingReviewId || undefined,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      })

      // Reset form after successful submission
      resetForm()
      onClose()
    } catch (error) {
      console.log('Error submitting review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Fetch existing review when modal opens
  useEffect(() => {
    const fetchExistingReview = async () => {
      // Only fetch if modal is open and we have required data
      if (!open || !userId || !productId) {
        return
      }

      try {
        setIsLoading(true)
        const res = await axios.get('/api/review/existing', {
          params: { userId, productId },
        })

        const review = res.data.review
        if (review) {
          // Prefill form with existing review data
          setRating(review.rating || 0)
          setTitle(review.title || '')
          setComment(review.comment || '')
          setExistingReviewId(review.id)
        } else {
          // Reset form if no existing review
          resetForm()
        }
      } catch (error) {
        console.error('Failed to fetch existing review:', error)
        // Reset form on error
        resetForm()
      } finally {
        setIsLoading(false)
      }
    }

    fetchExistingReview()
  }, [open, userId, productId]) // Dependencies: modal open state and IDs

  // Reset form when modal closes (cleanup)
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingReviewId ? 'Edit Review' : 'Add Review'}
          </DialogTitle>
          {productName && (
            <p className="text-sm text-gray-600">for {productName}</p>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">
              Loading existing review...
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  />
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Review Title</label>
              <Input
                placeholder="Summarize your review..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Review Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Comment (Optional)</label>
              <Textarea
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-full"
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-full bg-green hover:bg-transparent hover:text-green border-green"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting
              ? 'Submitting...'
              : existingReviewId
                ? 'Update Review'
                : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
