'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRefetch: () => void
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  onRefetch,
}: DataTableProps<TData, TValue>) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const selectedRows = table.getSelectedRowModel().rows
  const [openConfirm, setOpenConfirm] = useState(false)

  const handleDeleteSelected = async () => {
    const idsToDelete = selectedRows.map((row) => row.original.id)

    if (!idsToDelete.length) return

    try {
      setIsDeleting(true)
      await axios.post('/api/seller-products/delete-bulk', {
        ids: idsToDelete,
      })
      toast.success('Selected products deleted successfully.')
      onRefetch()
    } catch (error) {
      console.log(error)
      toast.error('Failed to delete selected products.')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const startRow = totalRows > 0 ? pageIndex * pageSize + 1 : 0
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm text-muted-foreground font-medium">
          {selectedRows.length} item{selectedRows.length !== 1 ? 's' : ''} selected
        </span>
        <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={selectedRows.length === 0 || isDeleting}
              className="rounded-lg shadow-sm"
            >
              {isDeleting ? 'Deleting...' : 'Delete Selected'}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Delete Selected Products
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 mt-1">
                    This action will permanently delete {selectedRows.length}{' '}
                    selected{' '}
                    {selectedRows.length === 1 ? 'product' : 'products'}.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete these products? This cannot be
                undone.
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setOpenConfirm(false)}
                disabled={isDeleting}
                className="order-2 sm:order-1 mx-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="order-1 sm:order-2 min-w-[100px]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-600 font-semibold h-12">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <p className="text-base font-medium text-gray-900 mt-2">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-100 gap-4">
        <span className="text-sm text-gray-500 font-medium">
          {totalRows > 0 ? `Showing ${startRow} to ${endRow} of ${totalRows} results` : 'No results'}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
