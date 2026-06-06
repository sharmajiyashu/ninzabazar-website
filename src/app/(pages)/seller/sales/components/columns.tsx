'use client'

import { ColumnDef } from '@tanstack/react-table'
import {
  ProductsCell,
  CustomerCell,
  TotalPriceCell,
  StatusCell,
  PaymentStatusCell,
  ShippingAddressCell,
  CreatedAtCell,
  OrderIdCell,
  ActionsCell,
} from './cells'

import { Order } from '@/app/types/type'

export const columns = (): ColumnDef<Order>[] => [
  // ORDER ID -----------------------------------
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({ row }) => <OrderIdCell orderId={row.original.id} />,
    size: 100,
  },

  // PRODUCTS -----------------------------------
  {
    accessorKey: 'orderItems',
    header: 'Products',
    cell: ({ row }) => <ProductsCell order={row.original} />,
    size: 250,
  },

  // CUSTOMER -----------------------------------
  {
    accessorKey: 'buyer',
    header: 'Customer',
    cell: ({ row }) => <CustomerCell order={row.original} />,
    size: 180,
  },

  // TOTAL PRICE (SELLER PORTION) --------------------------------------
  {
    accessorKey: 'sellerTotal',
    header: 'Total Amount',
    cell: ({ row }) => <TotalPriceCell order={row.original} />,
    size: 120,
  },

  // STATUS-----------------------------------
  {
    accessorKey: 'status',
    header: 'Order Status',
    cell: ({ row }) => <StatusCell status={row.original.status} />,
    size: 120,
  },

  // PAYMENT STATUS -----------------------------------
  {
    accessorKey: 'EscrowPayment',
    header: 'Payment',
    cell: ({ row }) => <PaymentStatusCell order={row.original} />,
    size: 120,
  },

  // SHIPPING ADDRESS ----------------------------------------------
  {
    accessorKey: 'shippingAddress',
    header: 'Shipping Address',
    cell: ({ row }) => <ShippingAddressCell order={row.original} />,
    size: 200,
  },

  // CREATED AT ----------------------------------------------
  {
    accessorKey: 'createdAt',
    header: 'Order Date',
    cell: ({ row }) => <CreatedAtCell createdAt={row.original.createdAt} />,
    size: 140,
  },

  // ACTIONS --------------------------------------------------------
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell order={row.original} />,
    size: 100,
    enableSorting: false,
  },
]

// Alternative minimal columns for mobile/compact view
export const compactColumns = (): ColumnDef<Order>[] => [
  // ORDER ID -----------------------------------
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <OrderIdCell orderId={row.original.id} />,
    size: 80,
  },

  // PRODUCTS -----------------------------------
  {
    accessorKey: 'orderItems',
    header: 'Products',
    cell: ({ row }) => <ProductsCell order={row.original} />,
    size: 200,
  },

  // TOTAL PRICE --------------------------------------
  {
    accessorKey: 'sellerTotal',
    header: 'Amount',
    cell: ({ row }) => <TotalPriceCell order={row.original} />,
    size: 100,
  },

  // STATUS-----------------------------------
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusCell status={row.original.status} />,
    size: 100,
  },

  // ACTIONS --------------------------------------------------------
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell order={row.original} />,
    size: 80,
    enableSorting: false,
  },
]
