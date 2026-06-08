'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ActionsCell,
  CategoryCell,
  LastUpdatedCell,
  ProductCell,
  StatusCell,
  VisibilityCell,
} from './components/products-cell'
import { ProductDataProps } from '@/app/types/type'
export const columns = ({
  onRefetch,
}: {
  onRefetch: () => void
}): ColumnDef<ProductDataProps>[] => [
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
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => <ProductCell product={row.original} />,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <CategoryCell
        category={row.original.category}
        subCategory={row.original.subCategory}
      />
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => <LastUpdatedCell product={row.original} />,
  },
  {
    accessorKey: 'status',
    header: 'Review Status',
    cell: ({ row }) => <StatusCell product={row.original} />,
  },
  {
    accessorKey: 'isActive',
    header: 'Listing',
    cell: ({ row }) => (
      <VisibilityCell product={row.original} onRefetch={onRefetch} />
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ActionsCell product={row.original} onDeleted={onRefetch} />
    ),
  },
]
