'use client'

import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Image from 'next/image'
import { Order } from '@/app/types/type'
import { ORDER_STATUSES } from '@/lib/order-status'
import CurrencyFormatter from '@/app/components/ui-utils/currency-format'
import WaybillDownload from './waybill-download'
import OrderDetailsModal from './order-detail-modal'
import UpdateStatusModal from './update-status-modal'
import CancelOrderDialog from './cancel-order-modal'

// Products Cell - Updated to show order items from seller
export const ProductsCell = ({ order }: { order: Order }) => {
  return (
    <div className="flex flex-col gap-2">
      {order.orderItems.map((item) => {
        const defaultImage = item.product.images?.[0] || {
          urlpath: '/placeholder.png',
          alt: 'Product Image',
        }

        return (
          <div key={item.id} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
              <Image
                width={40}
                height={40}
                src={defaultImage.urlpath}
                alt={item.product.name + 'Image' || 'Product Image'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{item.product.name}</span>
              {item.variant && (
                <span className="text-xs text-white">
                  {item.variant.title}: {item.variant.option}
                </span>
              )}
              <span className="text-xs text-orange">Qty: {item.quantity}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Customer Cell - Updated to show buyer information
export const CustomerCell = ({ order }: { order: Order }) => {
  const { buyer } = order
  const fullName = `${buyer.user.firstName} ${buyer.user.lastName}`

  return (
    <div className="flex flex-col">
      <span className="font-medium text-sm">{fullName}</span>
      <span className="text-xs text-white">{buyer.user.email}</span>
      {buyer.user.contactNumber && (
        <span className="text-xs text-white">{buyer.user.contactNumber}</span>
      )}
    </div>
  )
}

// Total Price Cell - Updated to use sellerTotal
export const TotalPriceCell = ({ order }: { order: Order }) => {
  return (
    <span className="font-medium">
      <CurrencyFormatter amount={order.sellerTotal} />
    </span>
  )
}

// Status Cell - Updated for order status
export const StatusCell = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-green-100 text-green-800'
      case 'delivered':
        return 'bg-teal-200 text-teal-900'
      case 'completed':
        return 'bg-emerald-400 text-emeberald-700'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Badge
      variant="secondary"
      className={`rounded-full ${getStatusStyles(status)}`}
    >
      {status.toUpperCase()}
    </Badge>
  )
}

// Shipping Address Cell
export const ShippingAddressCell = ({ order }: { order: Order }) => {
  const { shippingAddress } = order

  // Handle case where shippingAddress might be null
  if (!shippingAddress) {
    return (
      <div className="flex items-center justify-center text-sm text-white">
        <span>No address</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col text-sm">
      <span>{shippingAddress.street}</span>
      <span>
        {shippingAddress.city}, {shippingAddress.state}{' '}
        {shippingAddress.postalCode}
      </span>
      <span>{shippingAddress.country}</span>
    </div>
  )
}

// Payment Status Cell
export const PaymentStatusCell = ({ order }: { order: Order }) => {
  const escrowPayment = order.EscrowPayment

  if (!escrowPayment) {
    return <Badge variant="secondary">N/A</Badge>
  }

  const getPaymentStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'held':
        return 'bg-blue-100 text-blue-800'
      case 'released':
        return 'bg-green-100 text-green-800'
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Badge
        variant="secondary"
        className={`rounded-full text-xs ${getPaymentStatusStyles(escrowPayment.status)}`}
      >
        {escrowPayment.status.charAt(0).toUpperCase() +
          escrowPayment.status.slice(1)}
      </Badge>
      <span className="text-xs text-gray-500">
        ${parseFloat(escrowPayment.amount).toFixed(2)}
      </span>
    </div>
  )
}

// Created At Cell
export const CreatedAtCell = ({ createdAt }: { createdAt: string }) => {
  const date = new Date(createdAt)
  return (
    <div className="flex flex-col text-sm">
      <span>{format(date, 'MMM dd, yyyy')}</span>
      <span className="text-xs text-white">{format(date, 'h:mm a')}</span>
    </div>
  )
}

// Order ID Cell
export const OrderIdCell = ({ orderId }: { orderId: string }) => {
  return (
    <span className="font-mono text-sm text-white">
      #{orderId.slice(-8).toUpperCase()}
    </span>
  )
}

// Actions Cell - Updated with relevant seller actions
export const ActionsCell = ({ order }: { order: Order }) => {
  const [openDetails, setOpenDetails] = useState(false)
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false)

  const status = order.status.toUpperCase()

  const handleViewOrder = () => setOpenDetails(true)
  const handleUpdateStatus = () => setOpenUpdateStatus(true)

  const showCancel = status === ORDER_STATUSES.PROCESSING
  const showUpdateStatus = status === ORDER_STATUSES.PROCESSING
  const showWaybill = (
    [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.SHIPPED] as string[]
  ).includes(status)

  return (
    <>
      <div className="flex gap-2 w-full ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="bg-white text-xs text-emerald-700 font-medium rounded-full px-4 py-1 hover:bg-gray-100 border border-emerald-200"
            >
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleViewOrder}>
              <span className="w-full text-center">View Details</span>
            </DropdownMenuItem>

            {showUpdateStatus && (
              <DropdownMenuItem onClick={handleUpdateStatus}>
                <span className="w-full text-center">Shipped Product</span>
              </DropdownMenuItem>
            )}

            {showWaybill && (
              <DropdownMenuItem asChild>
                <WaybillDownload order={order} />
              </DropdownMenuItem>
            )}

            {showCancel && (
              <DropdownMenuItem asChild>
                <CancelOrderDialog order={order} />
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modals placed outside of dropdown to prevent close bug */}
      <OrderDetailsModal
        open={openDetails}
        onOpenChange={setOpenDetails}
        order={order}
      />
      <UpdateStatusModal
        open={openUpdateStatus}
        onOpenChange={setOpenUpdateStatus}
        order={order}
      />
    </>
  )
}
