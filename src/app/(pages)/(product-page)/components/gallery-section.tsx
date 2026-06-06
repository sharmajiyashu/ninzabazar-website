'use client'
import * as React from 'react'
import { useState } from 'react'
import Image from 'next/image'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { ProductImageProps } from '@/app/types/type'

const Gallery = () => {
  const params = useParams()
  const id = params.id

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await axios.get(`/api/product-details/get?id=${id}`)
      return res.data
    },
  })

  const defaultImage = product?.images?.find(
    (img: { isDefault?: boolean }) => img.isDefault
  ) ||
    product?.images?.[0] || { urlpath: '/placeholder.png' }

  const [mainImage, setMainImage] = useState(defaultImage.urlpath)

  // Single handler for both hover and click
  const handleImageSelect = (imageSrc: string) => {
    setMainImage(imageSrc)
  }

  return (
    <div className="w-full px-4 md:px-0 md:w-[30rem] pt-10 md:pt-20">
      <div className="rounded-xl w-full h-0 pb-[100%] relative">
        {product && (
          <Image
            src={mainImage}
            alt={product.images?.[0]?.alt || 'Product image'}
            fill
            quality={100}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={true}
            className="object-cover rounded-xl"
          />
        )}
      </div>

      {/* Carousel of thumbnails */}
      <div className="flex justify-start mt-4 md:space-x-4">
        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full"
        >
          <CarouselContent>
            {product?.images?.map(
              (imageObj: ProductImageProps, imageIndex: number) => (
                <CarouselItem
                  key={imageObj.id || imageIndex}
                  className="basis-1/4 md:basis-1/2 lg:basis-1/3"
                >
                  <div
                    className="relative mx-1 cursor-pointer w-20 h-20 md:w-38 md:h-38"
                    onMouseEnter={() => handleImageSelect(imageObj.urlpath)}
                    onClick={() => handleImageSelect(imageObj.urlpath)}
                  >
                    <Image
                      src={imageObj.urlpath}
                      alt={imageObj.alt || 'Product image'}
                      fill
                      quality={90}
                      sizes="(max-width: 768px) 33vw, 25vw"
                      className={`object-cover rounded-xl transition-opacity ${mainImage === imageObj.urlpath ? 'border-2 border-green' : ''}`}
                    />
                  </div>
                </CarouselItem>
              )
            )}
          </CarouselContent>
          <div className="hidden md:flex">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </div>
  )
}
export default Gallery
