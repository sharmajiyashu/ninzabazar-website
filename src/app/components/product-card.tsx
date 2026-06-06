import React from 'react'
import { ProductCardProps } from '../types/type'
import Image from 'next/image'
import { StarRating } from './ui-utils/star-rating'

const ProductCard: React.FC<ProductCardProps> = ({
  images,
  name,
  basePrice,
  isSale,
  salePrice,
  reviews = [],
  totalPurchases = 0,
}) => {
  // Find the default image or fallback to the first image
  const defaultImage = images?.find((img) => img.isDefault) || images?.[0]

  const avgRating = () => {
    if (reviews?.length === 0) return 0

    const total = reviews?.reduce((total, review) => total + review.rating, 0)
    return total / reviews?.length
  }

  // Truncate the title if it's too long
  const truncateText = (text: string, maxLength: number) => {
    return text?.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  return (
    <div className="flex flex-col items-center h-64 gap-4 py-6 my-2 bg-white rounded-lg md:px-4 md:my-4 w-44 md:w-52 md:h-80 drop-shadow-lg">
      {/* Product Image Desktop */}
      <div className="items-center justify-center hidden w-full md:flex h-36">
        {defaultImage ? (
          <Image
            width={144}
            height={144}
            src={defaultImage.urlpath}
            alt={name + ' image'}
            className="object-cover w-36 h-36 rounded-md"
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-200 rounded-md w-36 h-36">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="flex items-center justify-center w-full md:hidden h-28">
        {defaultImage ? (
          <Image
            width={112}
            height={112}
            src={defaultImage.urlpath}
            alt={name + ' image'}
            className="object-cover rounded-md w-28 h-28"
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-200 rounded-md w-28 h-28">
            <span className="text-xs text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col items-start w-full px-2 md:gap-2 md:px-0">
        {/* Title with truncation */}
        <h1 className="text-sm font-semibold text-gray-800 md:text-lg md:h-6 ">
          {/* mobile */}
          <span className="block md:hidden">{truncateText(name, 22)}</span>
          {/* desktop */}
          <span className="hidden md:block">{truncateText(name, 16)}</span>
        </h1>

        {/* Price */}

        {isSale ? (
          <div className="flex space-x-2">
            <span className="text-sm font-bold text-green-600 md:text-md">
              ${Number(salePrice).toFixed(2)}
            </span>
            <span className="text-sm font-bold text-gray-400 line-through md:text-md">
              ${Number(basePrice).toFixed(2)}
            </span>
          </div>
        ) : (
          <div>
            <span className="text-sm font-bold text-green-600 md:text-md">
              ${Number(basePrice).toFixed(2)}
            </span>
          </div>
        )}

        {/* Star Ratings */}
        <div className="flex items-center md:gap-2 md:mt-1">
          <StarRating rating={avgRating()} />
          <h3 className="flex mx-1 text-xs text-gray-500">
            {reviews?.length}{' '}
            <span className="hidden mx-1 md:flex"> reviews</span>
          </h3>
        </div>

        {/* Add Sold Count */}
        {totalPurchases > 0 && (
          <div className="mt-1 text-xs text-gray-600">
            {totalPurchases} sold
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
