'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowSelectionChange?: (selectedRows: string[]) => void
  selectedRows?: string[]
}

export function DataTable<TData extends { id?: string }, TValue>({
  columns,
  data,
  onRowSelectionChange,
  selectedRows,
}: DataTableProps<TData, TValue>) {
  const getRowSelectionFromIds = React.useCallback(() => {
    if (!selectedRows || selectedRows.length === 0) return {}

    const selectionState: RowSelectionState = {}
    data.forEach((row, index) => {
      if (row.id && selectedRows.includes(row.id)) {
        selectionState[index] = true
      }
    })
    return selectionState
  }, [selectedRows, data])

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    () => getRowSelectionFromIds()
  )

  // Update rowSelection when selectedRows changes externally
  React.useEffect(() => {
    setRowSelection(getRowSelectionFromIds())
  }, [getRowSelectionFromIds])

  // Watch for changes in row selection and notify parent
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedIds = Object.keys(rowSelection)
        .filter((index) => rowSelection[index])
        .map((index) => {
          const rowIndex = parseInt(index)
          return data[rowIndex]?.id
        })
        .filter((id): id is string => id !== undefined)

      // Only call onRowSelectionChange if the selection actually changed
      const currentSelection = selectedRows || []
      const hasChanged =
        selectedIds.length !== currentSelection.length ||
        selectedIds.some((id) => !currentSelection.includes(id))

      if (hasChanged) {
        onRowSelectionChange(selectedIds)
      }
    }
  }, [rowSelection, data, onRowSelectionChange, selectedRows])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    enableRowSelection: true,
  })

  return (
    <div className="w-full bg-white rounded-md shadow-sm">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="py-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-t py-4"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No items in cart.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
