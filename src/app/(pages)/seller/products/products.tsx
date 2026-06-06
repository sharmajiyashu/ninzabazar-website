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

const ProductsPage = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({
    name: '',
    // model: '',
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
        // const matchesModel = filters.model
        //   ? (product.variantCombination ?? [])
        //       .join(' ')
        //       .toLowerCase()
        //       .includes(filters.model.toLowerCase())
        //   : true
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
    <div className="max-w-7xl mx-auto px-10 pb-20">
      <div className="flex justify-between items-center mt-10 mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
      </div>

      <section className="border rounded-lg p-6 bg-white shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4 items-center text-sm justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-medium text-lg">Search:</span>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={filters.name}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-4 py-1 text-sm w-64"
            />
            {/* <input
            type="text"
            name="model"
            placeholder="Product Model"
            value={filters.model}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-md px-4 py-1 text-sm w-64"
          /> */}
            <Button
              onClick={clearFilters}
              variant="outline"
              className="text-sm"
            >
              Clear
            </Button>
          </div>
          <div>
            <Button
              onClick={() => router.push('/seller/post')}
              className="bg-green hover:bg-green-800 text-white text-sm py-2 px-6 rounded-full"
            >
              Post a Product
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-lg">Filters:</span>
          {statusOptions.map((status) => (
            <Button
              key={status}
              onClick={() => handleStatusClick(status)}
              variant={filters.status === status ? 'default' : 'outline'}
              className="text-sm bg-orange hover:bg-orange-600 text-white hover:text-white py-1 px-auto rounded-full"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </section>

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
