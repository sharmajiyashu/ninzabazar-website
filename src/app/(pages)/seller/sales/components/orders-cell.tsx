'use client'

import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import Image from 'next/image'
import {
  Eye,
  MoreVertical,
  Truck,
  XCircle,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react'
import { Order } from '@/app/types/type'
import { ORDER_STATUSES, getSellerStatusAction } from '@/lib/order-status'
import CurrencyFormatter from '@/app/components/ui-utils/currency-format'
import { useWaybillDownload } from './waybill-download'
import OrderDetailsModal from './order-detail-modal'
import UpdateStatusModal from './update-status-modal'
import CancelOrderDialog from './cancel-order-modal'
import { openFromDropdown } from '@/lib/radix-ui-fixes'
import { FileDown } from 'lucide-react'

export const OrderCell = ({ order }: { order: Order }) => {
  const firstItem = order.orderItems[0]
  const extraCount = order.orderItems.length - 1

  if (!firstItem) {
    return <span className="text-sm text-muted-foreground">No items</span>
  }

  const defaultImage = firstItem.product?.images?.[0] || {
    urlpath: '/placeholder.png',
    alt: 'Product Image',
  }

  return (
    <div className="flex items-center gap-x-3 min-w-[220px]">
      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
        <Image
          src={defaultImage.urlpath}
          alt={defaultImage.alt || firstItem.product?.name || 'Product'}
          width={64}
          height={64}
          className="rounded-lg object-cover w-full h-full"
        />
      </div>
      <div>
        <p className="font-semibold text-gray-900 line-clamp-2">
          {firstItem.product?.name || 'Product'}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          #{order.id.slice(-8).toUpperCase()}
        </p>
        <p className="text-xs text-muted-foreground">
          Qty: {firstItem.quantity}
          {extraCount > 0 && ` · +${extraCount} more item${extraCount > 1 ? 's' : ''}`}
        </p>
        {firstItem.variant && (
          <p className="text-xs text-gray-500">
            {firstItem.variant.title}: {firstItem.variant.option}
          </p>
        )}
      </div>
    </div>
  )
}

export const CustomerCell = ({ order }: { order: Order }) => {
  const { buyer } = order
  const fullName = `${buyer.user.firstName} ${buyer.user.lastName}`

  return (
    <div className="flex flex-col text-sm min-w-[140px]">
      <span className="font-medium text-gray-900">{fullName}</span>
      <span className="text-xs text-muted-foreground">{buyer.user.email}</span>
      {buyer.user.contactNumber && (
        <span className="text-xs text-gray-500">{buyer.user.contactNumber}</span>
      )}
    </div>
  )
}

export const TotalPriceCell = ({ order }: { order: Order }) => {
  return (
    <span className="text-sm font-semibold text-orange-500">
      <CurrencyFormatter amount={order.sellerTotal} />
    </span>
  )
}

export const StatusCell = ({ status }: { status: string }) => {
  const normalized = status.toUpperCase()

  const config: Record<string, { label: string; className: string }> = {
    [ORDER_STATUSES.PROCESSING]: {
      label: 'Processing',
      className: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    [ORDER_STATUSES.SHIPPED]: {
      label: 'Shipped',
      className: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    [ORDER_STATUSES.DELIVERED]: {
      label: 'Delivered',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    [ORDER_STATUSES.COMPLETED]: {
      label: 'Completed',
      className: 'bg-green-50 text-green-700 border border-green-200',
    },
    [ORDER_STATUSES.CANCELLED]: {
      label: 'Cancelled',
      className: 'bg-red-50 text-red-700 border border-red-200',
    },
  }

  const statusConfig = config[normalized] ?? {
    label: status,
    className: 'bg-gray-50 text-gray-600 border border-gray-200',
  }

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}
    >
      {statusConfig.label}
    </span>
  )
}

export const ShippingAddressCell = ({ order }: { order: Order }) => {
  const { shippingAddress } = order

  if (!shippingAddress) {
    return <span className="text-sm text-muted-foreground">No address</span>
  }

  return (
    <div className="flex flex-col text-sm text-gray-600 max-w-[180px]">
      <span className="line-clamp-1">{shippingAddress.street}</span>
      <span className="text-xs text-muted-foreground">
        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
      </span>
    </div>
  )
}

export const PaymentStatusCell = ({ order }: { order: Order }) => {
  const escrowPayment = order.EscrowPayment

  if (!escrowPayment) {
    return (
      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
        N/A
      </span>
    )
  }

  const config: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    held: 'bg-blue-50 text-blue-700 border border-blue-200',
    released: 'bg-green-50 text-green-700 border border-green-200',
    refunded: 'bg-red-50 text-red-700 border border-red-200',
  }

  const statusKey = escrowPayment.status.toLowerCase()

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex w-fit px-2.5 py-1 rounded-full text-xs font-medium ${
          config[statusKey] || 'bg-gray-50 text-gray-600 border border-gray-200'
        }`}
      >
        {escrowPayment.status.charAt(0).toUpperCase() +
          escrowPayment.status.slice(1).toLowerCase()}
      </span>
      <span className="text-xs text-muted-foreground">
        <CurrencyFormatter amount={Number(escrowPayment.amount)} />
      </span>
    </div>
  )
}

export const CreatedAtCell = ({ createdAt }: { createdAt: string }) => {
  const date = new Date(createdAt)
  return (
    <div className="flex flex-col text-sm text-gray-600">
      <span>{format(date, 'MMM dd, yyyy')}</span>
      <span className="text-xs text-muted-foreground">{format(date, 'h:mm a')}</span>
    </div>
  )
}

export const ActionsCell = ({
  order,
  onRefetch,
}: {
  order: Order
  onRefetch?: () => void
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false)
  const [openCancel, setOpenCancel] = useState(false)
  const { download: downloadWaybill } = useWaybillDownload(order)

  const status = order.status.toUpperCase()
  const statusAction = getSellerStatusAction(order.status)

  const showCancel = status === ORDER_STATUSES.PROCESSING
  const showWaybill = (
    [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.SHIPPED] as string[]
  ).includes(status)

  const statusActionIcon = statusAction?.action === 'ship'
    ? Truck
    : statusAction?.action === 'deliver'
      ? PackageCheck
      : CheckCircle2
  const StatusActionIcon = statusAction ? statusActionIcon : Truck

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-[#006d44]/20 focus:ring-offset-1"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          className="w-48 shadow-lg border border-gray-200"
        >
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              openFromDropdown(() => setMenuOpen(false), () => setOpenDetails(true))
            }}
            className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 group"
          >
            <Eye className="h-4 w-4 text-blue-500" />
            <span className="text-gray-700">View Details</span>
          </DropdownMenuItem>

          {statusAction && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                openFromDropdown(() => setMenuOpen(false), () =>
                  setOpenUpdateStatus(true)
                )
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 group"
            >
              <StatusActionIcon className="h-4 w-4 text-emerald-600" />
              <span className="text-gray-700">{statusAction.title}</span>
            </DropdownMenuItem>
          )}

          {showWaybill && (
            <>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  openFromDropdown(() => setMenuOpen(false), () => {
                    void downloadWaybill()
                  })
                }}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 group"
              >
                <FileDown className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Print Label</span>
              </DropdownMenuItem>
            </>
          )}

          {showCancel && (
            <>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  openFromDropdown(() => setMenuOpen(false), () => setOpenCancel(true))
                }}
                className="flex items-center gap-2 cursor-pointer hover:bg-red-50 focus:bg-red-50 group"
              >
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600 font-medium">Cancel Order</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {openDetails && (
        <OrderDetailsModal
          open={openDetails}
          onOpenChange={setOpenDetails}
          order={order}
        />
      )}
      {openUpdateStatus && (
        <UpdateStatusModal
          open={openUpdateStatus}
          onOpenChange={setOpenUpdateStatus}
          order={order}
          onSuccess={onRefetch}
        />
      )}
      {openCancel && (
        <CancelOrderDialog
          order={order}
          open={openCancel}
          onOpenChange={setOpenCancel}
          onSuccess={onRefetch}
        />
      )}
    </>
  )
}

/** @deprecated use OrderCell */
export const ProductsCell = OrderCell

/** @deprecated */
export const OrderIdCell = ({ orderId }: { orderId: string }) => (
  <span className="font-mono text-sm text-gray-600">
    #{orderId.slice(-8).toUpperCase()}
  </span>
)
