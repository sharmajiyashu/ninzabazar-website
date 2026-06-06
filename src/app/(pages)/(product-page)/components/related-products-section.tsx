'use client'
import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ProductDataProps } from '@/app/types/type'

const RelatedProducts = () => {
  const params = useParams()
  const id = params.id
  const router = useRouter()

  const { data: currentProduct } = useQuery({
    queryKey: ['currentProduct', id],
    queryFn: async () => {
      const res = await axios.get(`/api/product-details/get?id=${id}`)
      return res.data
    },
  })

  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', currentProduct?.keywords.join(',')],
    queryFn: async () => {
      if (!currentProduct?.keywords || currentProduct.keywords.length === 0) {
        return []
      }
      const res = await axios.get(
        `/api/related-products?id=${currentProduct.id}&keywords=${currentProduct.keywords.join(',')}`
      )
      return res.data
    },
    enabled: !!currentProduct?.keywords && currentProduct.keywords.length > 0,
  })

  // must get default images from related products, status: 'waiting or api'
  const getDefaultImage = (product: ProductDataProps) => {
    return (
      product.images?.find((img: { isDefault: boolean }) => img.isDefault) ||
      product.images?.[0] || { urlpath: '/placeholder.png' }
    )
  }
  const handleGoToProduct = (productId: string) => {
    router.push(`/product/${productId}`)
  }
  return (
    <div className="justify-center px-6 mt-20 mb-14">
      {relatedProducts?.length !== 0 && (
        <h1 className="text-[25px] font-medium mb-4">Related Products</h1>
      )}
      <Carousel
        opts={{
          align: 'center',
        }}
        className="w-full"
      >
        <CarouselContent>
          {relatedProducts?.map((product: ProductDataProps, index: number) => {
            const defaultImage = getDefaultImage(product)
            console.log(defaultImage.urlpath)
            return (
              <CarouselItem
                key={product.id || index}
                onClick={() => handleGoToProduct(String(product.id))}
                className="pl- basis-1/3 cursor-pointer"
              >
                <div className="flex flex-col h-full p-2 border rounded-lg">
                  <div className="relative w-[full] h-20 md:h-48 rounded-md overflow-hidden mb-3">
                    <Image
                      src={defaultImage.urlpath || '/placeholder.png'}
                      alt={product.name || 'Product image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-sm md:text-xl font-medium truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="ml-1 text-xs text-gray-600">
                      {/* ({product.ratings}) */}
                    </span>
                  </div>
                  <div className="mt-1 font-bold text-green">
                    {product.isSale ? (
                      <span>${product.salePrice}</span>
                    ) : (
                      <span className="crossed">${product.basePrice}</span>
                    )}
                  </div>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

export default RelatedProducts
