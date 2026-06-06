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

  return (
    <div className="w-full bg-white rounded-lg shadow">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm text-muted-foreground">
          {selectedRows.length} selected
        </span>
        <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={selectedRows.length === 0 || isDeleting}
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

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-6">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center px-4 py-2">
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
