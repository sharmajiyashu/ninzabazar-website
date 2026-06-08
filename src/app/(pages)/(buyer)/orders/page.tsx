'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OrderContent from './components/order-content'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { UserProps } from '@/app/types/type'

const tabItems = [
  { value: 'allOrders', label: 'All Orders' },
  { value: 'toShipOrders', label: 'To Ship' },
  { value: 'toReceiveOrders', label: 'To Receive' },
  { value: 'completedOrders', label: 'Completed' },
  { value: 'cancelledOrders', label: 'Cancelled' },
  { value: 'orderReturns', label: 'Returns' },
]

const OrdersPage = () => {
  const { data: session } = useSession()

  const { data: user, isLoading: isUserLoading } = useQuery<UserProps>({
    queryKey: ['buyerProfile', session?.user.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
    enabled: !!session?.user.id,
  })

  const buyerId = user?.buyerProfile?.id

  const { data: orderData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['buyerOrders', buyerId],
    queryFn: async () => {
      const res = await axios.get(`/api/buyer-get-orders?buyerId=${buyerId}`)
      return res.data
    },
    enabled: !!buyerId,
  })

  if (isUserLoading || isOrdersLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-up">
      <Tabs defaultValue="allOrders">
        <div className="overflow-x-auto no-scrollbar -mx-2 sm:mx-0">
          <TabsList className="flex w-max min-w-full py-4 md:py-6 rounded-lg md:rounded-2xl gap-2 px-2 sm:px-0">
            {tabItems.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="whitespace-nowrap px-4 py-2 text-sm md:px-6 md:py-4 md:text-lg"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="my-1">
          {tabItems.map(({ value }) => (
            <TabsContent key={value} value={value}>
              <OrderContent
                store={orderData?.store || []}
                order={orderData?.order || []}
                orderStatus={orderData?.orderStatus || []}
                statusFilter={value}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}

export default OrdersPage
