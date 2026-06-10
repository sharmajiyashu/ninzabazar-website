'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { ORDER_STATUSES } from '@/lib/order-status'

export default function SellerOrderSummary() {
  const { data: session } = useSession()

  const { data, isLoading } = useQuery({
    queryKey: ['seller-order-stats'],
    queryFn: async () => {
      const res = await axios.get('/api/seller-order/stats')
      return res.data
    },
    enabled: !!session?.user?.id,
  })

  const stats = data?.stats

  const cards = [
    {
      label: 'Total Orders',
      value: stats?.total ?? 0,
      icon: Package,
      href: ROUTES.seller.sales,
    },
    {
      label: 'Processing',
      value: stats?.processing ?? 0,
      icon: Package,
      href: `${ROUTES.seller.sales}?status=${ORDER_STATUSES.PROCESSING}`,
    },
    {
      label: 'Shipped',
      value: stats?.shipped ?? 0,
      icon: Truck,
      href: `${ROUTES.seller.sales}?status=${ORDER_STATUSES.SHIPPED}`,
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: CheckCircle,
      href: `${ROUTES.seller.sales}?status=${ORDER_STATUSES.COMPLETED}`,
    },
    {
      label: 'Cancelled',
      value: stats?.cancelled ?? 0,
      icon: XCircle,
      href: `${ROUTES.seller.sales}?status=${ORDER_STATUSES.CANCELLED}`,
    },
  ]

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Order Overview</h2>
        <Link
          href={ROUTES.seller.sales}
          className="text-sm text-green-700 hover:underline"
        >
          Manage all orders
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:border-green-600 transition-colors"
            >
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <card.icon className="w-4 h-4" />
                {card.label}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </Link>
          ))}
        </div>
      )}

      {data?.recentOrders?.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="font-medium mb-3">Recent Orders</h3>
          <div className="space-y-3">
            {data.recentOrders.map(
              (order: {
                id: string
                status: string
                orderItems: { product: { name: string } }[]
                buyer: { user: { firstName: string; lastName: string } }
              }) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-gray-500">
                      {order.orderItems[0]?.product?.name || 'Product'} ·{' '}
                      {order.buyer.user.firstName} {order.buyer.user.lastName}
                    </p>
                  </div>
                  <span className="text-xs uppercase text-green-700">
                    {order.status}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
