'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'

import {
  ActionsCell,
  PriceCell,
  ProductCell,
  QuantityCell,
  TotalPriceCell,
} from './components/products-cell'
import { CartItem } from '@/app/types/type'

export const columns = (): ColumnDef<CartItem>[] => [
  // CHECKBOX ---------------------------------
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // PRODUCT -----------------------------------
  {
    accessorKey: 'product',
    header: 'Product',
    cell: ({ row }) => <ProductCell product={row.original} />,
  },
  // PRICE --------------------------------------
  {
    accessorKey: 'price',
    header: 'Unit Price',
    cell: ({ row }) => (
      <PriceCell
        salePrice={row.original.salePrice ?? 0}
        basePrice={row.original.basePrice ?? 0}
      />
    ),
  },
  // QUANTITY-----------------------------------
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const { id, productId, quantity, buyerId } = row.original
      return (
        <QuantityCell
          productId={productId}
          userId={buyerId}
          id={id}
          quantity={quantity}
        />
      )
    },
  },
  // TOTALPRICE ----------------------------------------------
  {
    accessorKey: 'totalPrice',
    header: 'Total Price',
    cell: ({ row }) => {
      return <TotalPriceCell product={row.original} />
    },
  },
  // ACTIONS --------------------------------------------------------
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ActionsCell
        productId={row.original.productId}
        variantCombination={row.original.variantCombination}
        userId={row.original.buyerId}
      />
    ),
  },
]
