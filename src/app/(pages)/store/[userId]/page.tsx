'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import Banner from '../banner'
import ProductCard from '@/app/components/product-card'
import { SellerProfileProps } from '@/app/types/type'
import { Button } from '@/components/ui/button'
import { Globe, Building2 } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const SellerProfile = () => {
  const { userId } = useParams() as { userId: string }

  const [page, setPage] = useState(1)
  const limit = 10

  const {
    data: seller,
    error,
    isLoading,
  } = useQuery<
    SellerProfileProps & {
      totalProducts: number
      currentPage: number
      totalPages: number
    }
  >({
    queryKey: ['seller', userId, page],
    queryFn: async () => {
      const res = await axios.get(
        `/api/getSellerProfile?userId=${userId}&page=${page}&limit=${limit}`
      )
      return res.data
    },
    enabled: !!userId,
  })

  const NavigationLinks: Record<string, string> = {
    Home: `/store/${userId}`,
    Company: `/store/${userId}/company`,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-green mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading store profile...</p>
        </div>
      </div>
    )
  }

  if (error || !seller) {
    console.log(error)
    console.log('seller', seller)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            Error: {error ? String(error) : 'Unknown error'}
          </p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    )
  }

  const products = seller.products || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      {/* Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative w-full py-16 flex justify-center items-center">
          <Banner sellerInfo={seller} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative -mt-8">
        <div className="flex justify-center px-4 md:px-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-2">
            <div className="flex space-x-1">
              {Object.entries(NavigationLinks).map(([name, href]) => (
                <div key={name} className="relative group">
                  <Link
                    href={href}
                    className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                      name === 'Home'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {name === 'Home' && <Globe className="w-5 h-5" />}
                    {name === 'Company' && <Building2 className="w-5 h-5" />}
                    {name === 'Home' ? 'Store' : name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600 text-lg">
            Explore items listed by this seller
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            No products listed yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => {
              const images =
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images
                  : [{ urlpath: '/placeholder.png', isDefault: true }]

              return (
                <Link href={`/product/${product.id}`} key={product.id}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    images={images}
                    basePrice={product.basePrice}
                    isSale={product.isSale}
                    salePrice={product.salePrice}
                    reviews={
                      product.reviews?.map((review, index) => ({
                        id: `${product.id}-${index}`,
                        rating: review.rating,
                      })) || []
                    }
                  />
                </Link>
              )
            })}
          </div>
        )}

        {/* Fixed pagination condition - accessing totalPages directly from seller */}
        {seller?.totalPages && seller.totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={
                      page === 1 ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>

                {[...Array(seller.totalPages)].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={page === pageNum}
                        onClick={() => {
                          setPage(pageNum)
                          window.scrollTo({ top: 400, behavior: 'smooth' })
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, seller.totalPages))
                    }
                    className={
                      page === seller.totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <div className="h-20" />
    </div>
  )
}

export default SellerProfile
