'use client'

import React, { useEffect, useState } from 'react'
import { OrdersPageProps, Conversation } from '@/app/types/type'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Store } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useBuyerConversations } from '@/app/hooks/useConversation'
import { ConfirmReceiptModal } from './order-confirm-modal'
import { OrderDetailsModal } from './view-detail-modal'
import { AddReviewModal } from './add-review-modal'

const OrderContent: React.FC<OrdersPageProps> = ({
  store = [],
  order = [],
  statusFilter,
}) => {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: conversations } = useBuyerConversations(
    session?.user.id as string
  )

  const [openConfirm, setOpenConfirm] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [openReview, setOpenReview] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<(typeof order)[0] | null>(
    null
  )
  const [existingReviews, setExistingReviews] = useState<
    Record<string, boolean>
  >({})

  // Move useEffect to the top level
  useEffect(() => {
    const fetchExistingReviews = async () => {
      try {
        const reviewChecks = await Promise.all(
          order.map((item) =>
            axios
              .get('/api/review/existing', {
                params: {
                  productId: item.productId,
                  userId: session?.user.id,
                },
              })
              .then((res) => ({
                productId: item.productId,
                exists: res.data.review !== null,
              }))
          )
        )

        const reviewMap = Object.fromEntries(
          reviewChecks.map((r) => [r.productId, r.exists])
        )

        setExistingReviews(reviewMap)
      } catch (error) {
        console.error('Error fetching review statuses:', error)
      }
    }

    if (session?.user.id && order.length > 0) {
      fetchExistingReviews()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id, order.length])

  const getStoreName = (storeId: string) => {
    const storeInfo = store.find((s) => s.storeId === storeId)
    return storeInfo ? storeInfo.storeName : 'Unknown Store'
  }

  const statusMap: Record<string, string> = {
    toShipOrders: 'processing',
    toReceiveOrders: 'shipped',
    completedOrders: 'completed',
    cancelledOrders: 'cancelled',
    orderReturns: 'returned',
  }

  const filterOrders = () => {
    if (statusFilter === 'allOrders') return order
    const targetStatus = statusMap[statusFilter]
    return targetStatus
      ? order.filter((o) => o.statusType === targetStatus)
      : []
  }

  const groupedOrders = () => {
    if (statusFilter !== 'allOrders') {
      return { [statusFilter]: filterOrders() }
    }
    return {
      all: order,
    }
  }

  const getBuyerLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'To Ship'
      case 'shipped':
        return 'To Receive'
      case 'delivered':
        return 'Delivered'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      case 'returned':
        return 'Returned'
      default:
        return 'Unknown'
    }
  }

  const StatusBadge = ({ statusType }: { statusType: string }) => {
    const getStatusColor = () => {
      switch (statusType.toLowerCase()) {
        case 'processing':
          return 'text-yellow'
        case 'shipped':
          return 'text-orange-500'
        case 'delivered':
          return 'text-blue-600'
        case 'completed':
          return 'text-green'
        case 'cancelled':
        case 'returned':
          return 'text-red-500'
        default:
          return ''
      }
    }

    return (
      <span
        className={`py-1 text-sm md:text-xl font-medium ${getStatusColor()}`}
      >
        {getBuyerLabel(statusType)}
      </span>
    )
  }

  const handleConfirmReceipt = async () => {
    if (!selectedOrder) return

    try {
      await axios.put('/api/buyer-confirm-receipt', {
        orderId: selectedOrder.orderId,
      })
      toast.success('Order confirmed. Payment released to seller.')
      setOpenConfirm(false)
      router.refresh()
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
    if (!selectedOrder) return

    try {
      // Check if this is an update (existing review)
      if (reviewData.id && existingReviews[selectedOrder.productId]) {
        // Update existing review
        await axios.put(`/api/review/${reviewData.id}`, {
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
        })
        toast.success('Review updated!')
      } else {
        // Create new review
        await axios.post('/api/review', {
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          productId: selectedOrder.productId,
        })
        toast.success('Review submitted!')
      }

      // Refresh the existing reviews state
      setExistingReviews((prev) => ({
        ...prev,
        [selectedOrder.productId]: true,
      }))

      setOpenReview(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to submit review.')
    }
  }

  const handleMessageSeller = async (orderItem: (typeof order)[0]) => {
    const storeInfo = store.find((s) => s.storeId === orderItem.storeId)
    const sellerId = storeInfo?.storeId

    if (!sellerId) {
      toast.error('Seller not found.')
      return
    }

    const existingConversation = conversations?.find(
      (conv: Conversation) => conv.seller?.id === sellerId
    )

    if (existingConversation) {
      router.push(`/messages?xcnv=${existingConversation.id}`)
    } else {
      router.push(
        `/messages?sellerId=${sellerId}&productId=${orderItem.productId}&companyName=${encodeURIComponent(
          storeInfo?.storeName ?? 'ShopNameNull'
        )}&productName=${encodeURIComponent(
          orderItem.orderTitle ?? 'ProductNull'
        )}`
      )
    }
  }

  const handleViewStore = (orderItem: (typeof order)[0]) => {
    router.push(`/store/${orderItem.storeId}`)
  }

  const renderOrder = (orderItem: (typeof order)[0]) => {
    return (
      <div key={orderItem.orderItemId} className="px-4 py-6 mb-4 border-b">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <h4 className="flex items-center text-base md:text-lg font-medium">
            <Store className="w-5 h-5 mx-2" />
            {getStoreName(orderItem.storeId)}
            <Button
              onClick={() => handleMessageSeller(orderItem)}
              className="mx-2 md:mx-4 text-white border rounded-full bg-green border-green hover:text-green hover:bg-transparent"
            >
              Message Seller
            </Button>
            <Button
              onClick={() => handleViewStore(orderItem)}
              className="bg-transparent border rounded-full text-disabledgrey border-disabledgrey hover:text-white hover:bg-green hover:border-green"
            >
              View Store
            </Button>
          </h4>
          <StatusBadge statusType={orderItem.statusType} />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="mr-0 md:mr-4 overflow-hidden w-20 h-20 md:w-26 md:h-26">
            <Image
              src={orderItem.orderImg}
              alt={orderItem.orderTitle}
              width={100}
              height={100}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1 mt-4 md:mt-0">
            <p className="text-xs text-muted-foreground">
              Order ID: {orderItem.orderId}
            </p>
            <p className="font-medium">{orderItem.orderTitle}</p>
            <p className="text-gray-600">{orderItem.orderDetails}</p>
            <p className="text-gray-600">Qty: {orderItem.orderQty}</p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <p className="font-medium">${orderItem.orderPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-end mt-4 space-y-3 md:space-y-0 md:space-x-3">
          {orderItem.statusType === 'shipped' && (
            <Button
              className="px-6 text-white border rounded-full bg-green hover:bg-transparent hover:text-green border-green"
              onClick={() => {
                setSelectedOrder(orderItem)
                setOpenConfirm(true)
              }}
            >
              Order Received
            </Button>
          )}
          {orderItem.statusType === 'completed' && (
            <Button
              onClick={() => {
                setSelectedOrder(orderItem)
                setOpenReview(true)
              }}
              className="px-6 text-white border rounded-full bg-green hover:bg-transparent hover:text-green border-green"
            >
              {existingReviews[orderItem.productId]
                ? 'Edit Review'
                : 'Add Review'}
            </Button>
          )}
          <Button
            onClick={() => {
              setSelectedOrder(orderItem)
              setOpenDetails(true)
            }}
            variant="outline"
            className="border-gray-300 rounded-full"
          >
            View Details
          </Button>
        </div>
      </div>
    )
  }

  const groups = groupedOrders()

  return (
    <>
      {Object.entries(groups).map(([category, categoryOrders]) => {
        if (categoryOrders.length === 0) return null

        const title =
          category === 'recent'
            ? 'Recent Orders'
            : category === 'completed'
              ? 'Completed Orders'
              : category === 'cancelled'
                ? 'Cancelled/Returned Orders'
                : 'Orders'

        return (
          <div key={category} className="p-4 md:p-6 mb-4 border-2 rounded-xl">
            <h3 className="mb-4 text-lg md:text-xl font-semibold">{title}</h3>
            {categoryOrders.map((orderItem) => renderOrder(orderItem))}
          </div>
        )
      })}

      {Object.values(groups).flat().length === 0 && (
        <div className="p-4 md:p-6 border-2 rounded-xl">
          <div className="py-10 text-center">
            <h3 className="mb-2 text-lg md:text-xl font-semibold">
              No Orders Found
            </h3>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmReceiptModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmReceipt}
      />

      {selectedOrder && (
        <OrderDetailsModal
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          orderItem={selectedOrder}
          getBuyerLabel={getBuyerLabel}
        />
      )}

      {selectedOrder && (
        <AddReviewModal
          open={openReview}
          onClose={() => setOpenReview(false)}
          onSubmit={handleSubmitReview}
          productName={selectedOrder.orderTitle}
          userId={session?.user.id}
          productId={selectedOrder.productId}
        />
      )}
    </>
  )
}

export default OrderContent
