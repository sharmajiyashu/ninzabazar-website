'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { Search } from 'lucide-react'
import { DataTable } from './table'
import { columns } from './columns'
import { UserProps, Order } from '@/app/types/type'
import { ORDER_STATUSES } from '@/lib/order-status'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: ORDER_STATUSES.PROCESSING, label: 'Processing' },
  { value: ORDER_STATUSES.SHIPPED, label: 'Shipped' },
  { value: ORDER_STATUSES.DELIVERED, label: 'Delivered' },
  { value: ORDER_STATUSES.COMPLETED, label: 'Completed' },
  { value: ORDER_STATUSES.CANCELLED, label: 'Cancelled' },
]

const SalesPage = () => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
  })

  const { data: user, isLoading: userLoading } = useQuery<UserProps>({
    queryKey: ['user', session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
    enabled: !!session?.user?.id,
  })

  const sellerId = user?.sellerProfile?.id

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['seller-orders', sellerId],
    queryFn: async () => {
      const response = await axios.get('/api/seller-order/get')
      return response.data
    },
    enabled: !!sellerId,
  })

  const filteredOrders = useMemo(() => {
    const list: Order[] = ordersData?.orders || []
    const search = filters.search.trim().toLowerCase()

    return list.filter((order) => {
      const matchesStatus =
        filters.status === 'all' ? true : order.status === filters.status

      if (!search) return matchesStatus

      const orderId = order.id.toLowerCase()
      const customerName = `${order.buyer?.user?.firstName || ''} ${order.buyer?.user?.lastName || ''}`.toLowerCase()
      const customerEmail = (order.buyer?.user?.email || '').toLowerCase()
      const productNames = order.orderItems
        .map((item) => item.product?.name || '')
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        orderId.includes(search) ||
        customerName.includes(search) ||
        customerEmail.includes(search) ||
        productNames.includes(search)

      return matchesStatus && matchesSearch
    })
  }, [ordersData?.orders, filters])

  const refetchOrders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['seller-orders'] })
    queryClient.invalidateQueries({ queryKey: ['seller-order-stats'] })
  }, [queryClient])

  const tableColumns = useMemo(
    () => columns({ onRefetch: refetchOrders }),
    [refetchOrders]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }))
  }

  const handleStatusClick = (status: string) => {
    setFilters((prev) => ({ ...prev, status }))
  }

  const clearFilters = () => {
    setFilters({ search: '', status: 'all' })
  }

  if (userLoading || ordersLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2 mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Manage Orders
          </h1>
          <p className="text-gray-500 mt-1">
            View, search, and manage your customer orders
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="search"
              placeholder="Search by order ID, customer, or product..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006d44]/20 focus:border-[#006d44] transition-all text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => handleStatusClick(status.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filters.status === status.value
                    ? 'bg-[#006d44] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
            {(filters.search || filters.status !== 'all') && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 ml-2"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <DataTable columns={tableColumns} data={filteredOrders} />
      </div>
    </div>
  )
}

export default SalesPage
