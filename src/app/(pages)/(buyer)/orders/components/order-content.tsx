'use client'

import React, { useEffect, useState } from 'react'
import { BuyerOrderSummary, Conversation, OrdersPageProps } from '@/app/types/type'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ExternalLink, MessageCircle, Package, Store } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import { useBuyerConversations } from '@/app/hooks/useConversation'
import { ConfirmReceiptModal } from './order-confirm-modal'
import { OrderDetailsModal } from './view-detail-modal'
import { AddReviewModal } from './add-review-modal'
import { OrderStatusBadge } from '@/components/order-status-badge'
import CurrencyFormatter from '@/app/components/ui-utils/currency-format'
import { format } from 'date-fns'
import {
  canBuyerConfirmReceipt,
  canBuyerLeaveReview,
} from '@/lib/order-status'

const OrderContent: React.FC<OrdersPageProps> = ({ orders = [] }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { data: conversations } = useBuyerConversations(
    session?.user.id as string
  )

  const [openConfirm, setOpenConfirm] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [openReview, setOpenReview] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrderSummary | null>(
    null
  )
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  )
  const [existingReviews, setExistingReviews] = useState<
    Record<string, boolean>
  >({})

  useEffect(() => {
    const fetchExistingReviews = async () => {
      const productIds = [
        ...new Set(orders.flatMap((o) => o.items.map((i) => i.productId))),
      ]

      if (!session?.user.id || productIds.length === 0) return

      try {
        const reviewChecks = await Promise.all(
          productIds.map((productId) =>
            axios
              .get('/api/review/existing', {
                params: { productId, userId: session.user.id },
              })
              .then((res) => ({
                productId,
                exists: res.data.review !== null,
              }))
          )
        )

        setExistingReviews(
          Object.fromEntries(reviewChecks.map((r) => [r.productId, r.exists]))
        )
      } catch (error) {
        console.error('Error fetching review statuses:', error)
      }
    }

    fetchExistingReviews()
  }, [session?.user.id, orders])

  const handleConfirmReceipt = async () => {
    if (!selectedOrder) return

    try {
      await axios.put('/api/buyer-confirm-receipt', {
        orderId: selectedOrder.id,
      })
      toast.success('Order confirmed. Payment released to seller.')
      setOpenConfirm(false)
      await queryClient.invalidateQueries({ queryKey: ['buyerOrders'] })
    } catch (error) {
      console.error(error)
      toast.error('Failed to confirm receipt.')
    }
  }

  const handleSubmitReview = async (reviewData: {
    id?: string
    rating: number
    title: string
    comment: string
  }) => {
    if (!selectedOrder || !selectedProductId) return

    try {
      if (reviewData.id && existingReviews[selectedProductId]) {
        await axios.put(`/api/review/${reviewData.id}`, {
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
        })
        toast.success('Review updated!')
      } else {
        await axios.post('/api/review', {
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          productId: selectedProductId,
        })
        toast.success('Review submitted!')
      }

      setExistingReviews((prev) => ({
        ...prev,
        [selectedProductId]: true,
      }))

      setOpenReview(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to submit review.')
    }
  }

  const handleMessageSeller = async (order: BuyerOrderSummary) => {
    const sellerId = order.store.id

    if (!sellerId) {
      toast.error('Seller not found.')
      return
    }

    const existingConversation = conversations?.find(
      (conv: Conversation) => conv.seller?.id === sellerId
    )

    const firstProduct = order.items[0]

    if (existingConversation) {
      router.push(`/messages?xcnv=${existingConversation.id}`)
    } else {
      router.push(
        `/messages?sellerId=${sellerId}&productId=${firstProduct?.productId}&companyName=${encodeURIComponent(
          order.store.name
        )}&productName=${encodeURIComponent(firstProduct?.name ?? 'Product')}`
      )
    }
  }

  const renderOrderCard = (order: BuyerOrderSummary) => {
    const firstItem = order.items[0]
    const extraCount = order.items.length - 1

    return (
      <article
        key={order.id}
        className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-mono text-gray-500">
              #{order.id.slice(-8).toUpperCase()}
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-600">
              {format(new Date(order.createdAt), 'MMM d, yyyy')}
            </span>
            <span className="text-gray-400">·</span>
            <span className="flex items-center gap-1 text-gray-700">
              <Store className="h-3.5 w-3.5" />
              {order.store.name}
            </span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="p-4 flex flex-col sm:flex-row gap-4">
          {firstItem && (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={firstItem.image}
                alt={firstItem.name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 line-clamp-2">
              {firstItem?.name || 'Order items'}
            </p>
            {extraCount > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                +{extraCount} more item{extraCount > 1 ? 's' : ''}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {order.itemCount} item{order.itemCount !== 1 ? 's' : ''} total
            </p>
            {order.trackingLink && (
              <a
                href={order.trackingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#006d44] hover:underline mt-2"
              >
                Track shipment <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-lg font-semibold text-gray-900">
              <CurrencyFormatter amount={order.totalAmount} />
            </p>
          </div>
        </div>

        <div className="px-4 pb-4 flex flex-wrap gap-2 justify-end">
          {canBuyerConfirmReceipt(order.status) && (
            <Button
              size="sm"
              className="rounded-full bg-[#006d44] hover:bg-[#005a36] text-white"
              onClick={() => {
                setSelectedOrder(order)
                setOpenConfirm(true)
              }}
            >
              Confirm Received
            </Button>
          )}

          {canBuyerLeaveReview(order.status) &&
            order.items.map((item) => (
              <Button
                key={item.productId}
                size="sm"
                variant="outline"
                className="rounded-full border-[#006d44] text-[#006d44] hover:bg-[#006d44]/5"
                onClick={() => {
                  setSelectedOrder(order)
                  setSelectedProductId(item.productId)
                  setOpenReview(true)
                }}
              >
                {existingReviews[item.productId]
                  ? 'Edit Review'
                  : 'Leave Review'}
              </Button>
            ))}

          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => handleMessageSeller(order)}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            Message
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setSelectedOrder(order)
              setOpenDetails(true)
            }}
          >
            View Details
          </Button>
        </div>
      </article>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">No orders found</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          Orders matching your filter will appear here.
        </p>
        <Button
          className="mt-6 rounded-full bg-[#006d44] hover:bg-[#005a36]"
          onClick={() => router.push('/products')}
        >
          Browse Products
        </Button>
      </div>
    )
  }

  const selectedProduct = selectedOrder?.items.find(
    (i) => i.productId === selectedProductId
  )

  return (
    <>
      <div className="space-y-4">{orders.map(renderOrderCard)}</div>

      <ConfirmReceiptModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmReceipt}
      />

      {selectedOrder && (
        <OrderDetailsModal
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          order={selectedOrder}
        />
      )}

      {selectedOrder && selectedProductId && (
        <AddReviewModal
          open={openReview}
          onClose={() => setOpenReview(false)}
          onSubmit={handleSubmitReview}
          productName={selectedProduct?.name || 'Product'}
          userId={session?.user.id}
          productId={selectedProductId}
        />
      )}
    </>
  )
}

export default OrderContent
