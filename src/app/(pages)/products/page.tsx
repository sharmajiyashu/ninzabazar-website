'use client'
import ProductCard from '@/app/components/product-card'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { StarRating } from '@/app/components/ui-utils/star-rating'
// import { Checkbox } from '@/components/ui/checkbox'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ProductCardProps } from '@/app/types/type'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

const ProductsContent = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''
  const category = searchParams.get('category') || ''
  const subCategory = searchParams.get('subCategory') || ''
  const popular = searchParams.get('popular') === 'true' // Check for popular parameter

  const showRandomProducts = !query && !category && !popular
  const showPopularProducts = popular

  const { data: searchedProducts = [] } = useQuery({
    queryKey: ['products', query, category, subCategory],
    queryFn: async () => {
      let url = `/api/products?query=${query}&category=${category}`
      if (subCategory) url += `&subCategory=${subCategory}`
      
      const response = await axios.get(url)
      console.log('API response:', response.data)
      return response.data
    },
    enabled: !showRandomProducts && !showPopularProducts,
  })

  const { data: randomProducts = [] } = useQuery({
    queryKey: ['random-products'],
    queryFn: async () => {
      const response = await axios.get('/api/random-products?limit=28')
      return response.data
    },
    enabled: showRandomProducts,
  })

  const { data: popularProducts = [] } = useQuery({
    queryKey: ['popular-products'],
    queryFn: async () => {
      const response = await axios.get('/api/popular-products?limit=28')
      return response.data
    },
    enabled: showPopularProducts,
  })

  // Determine which products to show
  const products = showPopularProducts
    ? popularProducts
    : showRandomProducts
      ? randomProducts
      : searchedProducts

  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  // eslint-disable-next-line
  const calculateAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return Math.round(sum / reviews.length)
  }

  const getFilteredProducts = () => {
    let filteredProducts = [...products]

    if (selectedRating !== null) {
      filteredProducts = filteredProducts.filter((product) => {
        const avgRating = calculateAverageRating(product.reviews)
        return avgRating === selectedRating
      })
    }

    // Don't sort popular products as they're already sorted by rating
    if (!showPopularProducts) {
      filteredProducts.sort((a, b) => {
        const ratingA = calculateAverageRating(a.reviews)
        const ratingB = calculateAverageRating(b.reviews)
        return ratingB - ratingA
      })
    }

    return filteredProducts
  }

  if (!products) return <div>Loading...</div>

  return (
    <div className="min-h-screen flex md:justify-center md:items-start md:mx-10 my-6">
      <div className="w-64 md:flex flex-col hidden">
        <h1 className="text-xl font-bold mb-4">Filters: </h1>
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-3">Rating</h3>
          <div className="space-y-2">
            <button
              className={`flex items-center w-full hover:bg-gray-50 p-1 rounded ${
                selectedRating === 5
                  ? 'bg-orange-100 border-l-4 border-orange-500'
                  : ''
              }`}
              onClick={() => setSelectedRating(selectedRating === 5 ? null : 5)}
            >
              <StarRating rating={5} />
              <span className="ml-2 text-sm">5 stars</span>
            </button>

            <button
              className={`flex items-center w-full hover:bg-gray-50 p-1 rounded ${
                selectedRating === 4
                  ? 'bg-orange-100 border-l-4 border-orange-500'
                  : ''
              }`}
              onClick={() => setSelectedRating(selectedRating === 4 ? null : 4)}
            >
              <StarRating rating={4} />
              <span className="ml-2 text-sm">4 stars</span>
            </button>

            <button
              className={`flex items-center w-full hover:bg-gray-50 p-1 rounded ${
                selectedRating === 3
                  ? 'bg-orange-100 border-l-4 border-orange-500'
                  : ''
              }`}
              onClick={() => setSelectedRating(selectedRating === 3 ? null : 3)}
            >
              <StarRating rating={3} />
              <span className="ml-2 text-sm">3 stars</span>
            </button>

            <button
              className={`flex items-center w-full hover:bg-gray-50 p-1 rounded ${
                selectedRating === 2
                  ? 'bg-orange-100 border-l-4 border-orange-500'
                  : ''
              }`}
              onClick={() => setSelectedRating(selectedRating === 2 ? null : 2)}
            >
              <StarRating rating={2} />
              <span className="ml-2 text-sm">2 stars</span>
            </button>

            <button
              className={`flex items-center w-full hover:bg-gray-50 p-1 rounded ${
                selectedRating === 1
                  ? 'bg-orange-100 border-l-4 border-orange-500'
                  : ''
              }`}
              onClick={() => setSelectedRating(selectedRating === 1 ? null : 1)}
            >
              <StarRating rating={1} />
              <span className="ml-2 text-sm">1 star</span>
            </button>

            {/* Clear filter button */}
            {selectedRating && (
              <button
                className="flex items-center w-full hover:bg-red-50 p-1 rounded text-red-600 text-sm"
                onClick={() => setSelectedRating(null)}
              >
                <span>Clear rating filter</span>
              </button>
            )}
          </div>
        </div>

        {/* <div className="mb-6">
          <h3 className="font-medium text-lg mb-3">Colors</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                id="orange"
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label htmlFor="orange">Orange</label>
            </div>

            <div className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                id="black"
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label htmlFor="black">Black</label>
            </div>

            <div className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                id="white"
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label htmlFor="white">White</label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-lg mb-3">Payment Option</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                id="razorpay"
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label htmlFor="razorpay">RazorPay</label>
            </div>

            <div className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                id="paypal"
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label htmlFor="paypal">PayPal</label>
            </div>
          </div>
        </div> */}
      </div>

      <div className="flex-1">
        <div className="flex flex-col md:flex-row items-center md:justify-between text-base font-semibold">
          <span>
            {showPopularProducts ? (
              <span>Popular Products</span>
            ) : showRandomProducts ? (
              <span>Featured Products</span>
            ) : (
              <>
                Search Result for <span className="text-orange">{query}</span>
                {selectedRating && (
                  <span className="text-sm font-normal ml-2">
                    (Filtered by {selectedRating} stars)
                  </span>
                )}
              </>
            )}
          </span>
        </div>

        <div className="flex flex-wrap justify-between md:justify-normal md:gap-x-4 mx-3 md:mx-0">
          {getFilteredProducts().map((product: ProductCardProps) => {
            return (
              <Link href={`/product/${product.id}`} key={product.id}>
                <ProductCard
                  id={product.id}
                  images={product.images}
                  name={product.name}
                  basePrice={product.basePrice}
                  salePrice={product.salePrice}
                  isSale={product.isSale}
                  reviews={product.reviews}
                />
              </Link>
            )
          })}
        </div>

        {/* Show message if no products match filter */}
        {getFilteredProducts().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {showPopularProducts ? (
              <span>No popular products available at the moment.</span>
            ) : showRandomProducts ? (
              <span>No products available at the moment.</span>
            ) : selectedRating ? (
              <span>No products found with {selectedRating} star rating.</span>
            ) : (
              <span>No products found for your search.</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const LoadingMessages = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-green border-t-transparent rounded-full animate-spin mb-4"></div>
      <span className="text-gray-600 text-lg">Loading messages...</span>
    </div>
  </div>
)

const Page: React.FC = () => {
  return (
    <Suspense fallback={<LoadingMessages />}>
      <ProductsContent />
    </Suspense>
  )
}

export default Page
