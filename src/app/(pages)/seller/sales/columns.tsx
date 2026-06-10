'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Order } from '@/app/types/type'
import {
  OrderCell,
  CustomerCell,
  TotalPriceCell,
  StatusCell,
  PaymentStatusCell,
  ShippingAddressCell,
  CreatedAtCell,
  ActionsCell,
} from './components/orders-cell'

export const columns = ({
  onRefetch,
}: {
  onRefetch: () => void
}): ColumnDef<Order>[] => [
  {
    accessorKey: 'orderItems',
    header: 'Order',
    cell: ({ row }) => <OrderCell order={row.original} />,
  },
  {
    accessorKey: 'buyer',
    header: 'Customer',
    cell: ({ row }) => <CustomerCell order={row.original} />,
  },
  {
    accessorKey: 'sellerTotal',
    header: 'Amount',
    cell: ({ row }) => <TotalPriceCell order={row.original} />,
  },
  {
    accessorKey: 'status',
    header: 'Order Status',
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
  {
    accessorKey: 'EscrowPayment',
    header: 'Payment',
    cell: ({ row }) => <PaymentStatusCell order={row.original} />,
  },
  {
    accessorKey: 'shippingAddress',
    header: 'Shipping',
    cell: ({ row }) => <ShippingAddressCell order={row.original} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Order Date',
    cell: ({ row }) => <CreatedAtCell createdAt={row.original.createdAt} />,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ActionsCell order={row.original} onRefetch={onRefetch} />
    ),
    enableSorting: false,
  },
]
