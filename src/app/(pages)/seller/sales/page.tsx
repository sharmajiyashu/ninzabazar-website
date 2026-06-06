'use client'
import React, { useEffect, useState } from 'react'

import { DataTable } from './sales'
import { columns } from './components/columns'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { UserProps } from '@/app/types/type'

const Page = () => {
  // get session data
  const { data: session } = useSession()
  // Fetch user Data
  const { data: user, isLoading: userLoading } = useQuery<UserProps>({
    queryKey: ['buyerProfile', session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
    enabled: !!session?.user?.id,
  })
  const sellerId = user?.sellerProfile?.id

  // Fetch orders data
  const { data: ordersData, isLoading: ordersDataLoading } = useQuery({
    queryKey: ['seller-orders', sellerId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/seller-order/get?sellerId=${sellerId}`
      )
      console.log('Fetched Orders:', response.data)
      return response.data
    },
    enabled: !!sellerId,
  })

  const orders = React.useMemo(() => ordersData?.orders || [], [ordersData?.orders])

  // State Management
  const [activeFilter, setActiveFilter] = useState('all')
  const [filteredData, setFilteredData] = useState<any[]>([]) //eslint-disable-line

  useEffect(() => {
    if (orders.length > 0) {
      if (activeFilter === 'all') {
        setFilteredData(orders)
      } else {
        const filtered = orders.filter(
          // eslint-disable-next-line
          (order: any) =>
            order.status.toLowerCase() === activeFilter.toLowerCase()
        )
        setFilteredData(filtered)
      }
    }
  }, [orders, activeFilter])

  const handleFilterClick = ({ status }: { status: string }) => {
    setActiveFilter(status)
  }

  const filterOptions = ['all', 'to ship', 'shipped', 'cancelled', 'completed']

  // Show loading state
  if (ordersDataLoading || userLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-6 lg:p-10">
        <div className="max-w-full">
          <h1 className="text-2xl font-bold mb-6">My Sales</h1>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {filterOptions.map((option: string) => (
              <Button
                key={option}
                onClick={() => handleFilterClick({ status: option })}
                className={`border border-green-600 hover:bg-green transition-colors ${
                  activeFilter === option
                    ? 'bg-green text-white'
                    : 'bg-transparent text-green-600 hover:bg-green hover:text-white'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>

          {/* Data Table Container */}
          <div className="w-full overflow-x-auto">
            <DataTable columns={columns()} data={filteredData} />
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
