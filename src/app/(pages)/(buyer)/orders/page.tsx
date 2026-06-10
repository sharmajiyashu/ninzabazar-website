'use client'

import React, { useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Search, Package } from 'lucide-react'
import { UserProps, BuyerOrderSummary } from '@/app/types/type'
import OrderContent from './components/order-content'
import {
  matchesBuyerOrderFilter,
  type BuyerOrderFilter,
} from '@/lib/order-status'

const STATUS_FILTERS: { value: BuyerOrderFilter | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'toShipOrders', label: 'Preparing' },
  { value: 'toReceiveOrders', label: 'On the Way' },
  { value: 'completedOrders', label: 'Completed' },
  { value: 'cancelledOrders', label: 'Cancelled' },
]

const OrdersPage = () => {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BuyerOrderFilter | 'all'>(
    'all'
  )

  const { data: user, isLoading: isUserLoading } = useQuery<UserProps>({
    queryKey: ['buyerProfile', session?.user.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
    enabled: !!session?.user.id,
  })

  const buyerId = user?.buyerProfile?.id

  const { data: orderData, isLoading: isOrdersLoading } = useQuery<{
    orders: BuyerOrderSummary[]
  }>({
    queryKey: ['buyerOrders', buyerId],
    queryFn: async () => {
      const res = await axios.get(`/api/buyer-get-orders?buyerId=${buyerId}`)
      return res.data
    },
    enabled: !!buyerId,
  })

  const filteredOrders = useMemo(() => {
    const list = orderData?.orders || []
    const q = search.trim().toLowerCase()

    return list.filter((order) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : matchesBuyerOrderFilter(order.status, statusFilter)

      if (!q) return matchesStatus

      const orderId = order.id.toLowerCase()
      const storeName = order.store.name.toLowerCase()
      const productNames = order.items.map((i) => i.name.toLowerCase()).join(' ')

      const matchesSearch =
        orderId.includes(q) ||
        storeName.includes(q) ||
        productNames.includes(q)

      return matchesStatus && matchesSearch
    })
  }, [orderData?.orders, search, statusFilter])

  if (isUserLoading || isOrdersLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006d44]" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-up max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-7 w-7 text-[#006d44]" />
          My Orders
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage your purchases
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, store, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#006d44]/20 focus:border-[#006d44]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === value
                ? 'bg-[#006d44] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <OrderContent orders={filteredOrders} />
    </div>
  )
}

export default OrdersPage
