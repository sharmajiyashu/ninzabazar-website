'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { DataTable } from './table'
import { columns } from './columns'
import { UserProps } from '@/app/types/type'
import { useQueryClient } from '@tanstack/react-query'

import { Plus, Search } from 'lucide-react'

const ProductsPage = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({
    name: '',
    status: 'all',
  })
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]) //eslint-disable-line

  const { data: user, isLoading: userLoading } = useQuery<UserProps>({
    queryKey: ['user', session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
    enabled: !!session?.user?.id,
  })

  const sellerId = user?.sellerProfile?.id

  const { data: productsData = [], isLoading: productsLoading } = useQuery({
    queryKey: ['productSeller', sellerId],
    queryFn: async () =>
      (await axios.get(`/api/seller-products/get?sellerId=${sellerId}`)).data,
    enabled: !!sellerId,
  })

  useEffect(() => {
    if (productsData.length > 0) {
      // eslint-disable-next-line
      const filtered = productsData.filter((product: any) => {
        const matchesName = filters.name
          ? product.name?.toLowerCase().includes(filters.name.toLowerCase())
          : true
        const matchesStatus =
          filters.status === 'all' ? true : product.status === filters.status
        return matchesName && matchesStatus
      })
      setFilteredProducts(filtered)
    }
  }, [productsData, filters])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusClick = (status: string) => {
    setFilters((prev) => ({ ...prev, status }))
  }

  const clearFilters = () => {
    setFilters({ name: '', status: 'all' })
  }

  const refetchProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['productSeller'] })
  }

  const statusOptions = ['all', 'approved', 'rejected', 'pending']

  if (userLoading || productsLoading) {
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2 mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Products</h1>
          <p className="text-gray-500 mt-1">View, search, and manage your inventory</p>
        </div>
        <Button
          onClick={() => router.push('/seller/post')}
          className="bg-[#006d44] hover:bg-[#005a36] text-white shadow-md transition-all font-semibold rounded-lg px-6 py-2.5 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Post a Product
        </Button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="name"
              placeholder="Search products by name..."
              value={filters.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006d44]/20 focus:border-[#006d44] transition-all text-sm"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filters.status === status
                    ? 'bg-[#006d44] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
            {(filters.name || filters.status !== 'all') && (
              <button
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
        <DataTable
          columns={columns({ onRefetch: refetchProducts })}
          data={filteredProducts}
          onRefetch={refetchProducts}
        />
      </div>
    </div>
  )
}

export default ProductsPage
