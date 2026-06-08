'use client'

import Image from 'next/image'
import Link from 'next/link'
import ProductListCartIcon from '@/app/components/product-list-cart-icon'
import { toast } from 'sonner'

type B2BListingProduct = {
  id: string
  name: string
  basePrice: number | string
  salePrice?: number | string | null
  isSale?: boolean
  minOrderQuantity?: number | null
  images?: { urlpath: string; isDefault?: boolean }[]
  variants?: { price: number | string; hasPrice?: boolean }[]
}

function formatPriceRange(product: B2BListingProduct) {
  const prices = [Number(product.basePrice)]
  if (product.isSale && product.salePrice) prices.push(Number(product.salePrice))
  product.variants?.forEach((v) => {
    if (v.hasPrice) prices.push(Number(v.price))
  })
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return `₹${min.toLocaleString('en-IN')}`
  return `₹${min.toLocaleString('en-IN')} — ₹${max.toLocaleString('en-IN')}`
}

export default function B2BProductCard({ product }: { product: B2BListingProduct }) {
  const defaultImage =
    product.images?.find((img) => img.isDefault) || product.images?.[0]

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 relative group h-full">
      <Link
        href={`/product/${product.id}`}
        className="absolute top-3 right-3 z-10 transition-opacity hover:opacity-80"
        aria-label={`View ${product.name}`}
      >
        <ProductListCartIcon />
      </Link>

      <Link href={`/product/${product.id}`} className="flex flex-col h-full">
        <div className="flex items-center justify-center w-full aspect-square mb-4 bg-gray-50 rounded-xl overflow-hidden p-3">
          {defaultImage ? (
            <Image
              src={defaultImage.urlpath}
              alt={product.name}
              width={200}
              height={200}
              className="object-contain max-h-[160px] w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-gray-400 text-sm">No image</div>
          )}
        </div>

        <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-relaxed mb-2 min-h-[2.5rem]">
          {product.name}
        </h4>

        <p className="text-sm font-black text-[#006d44] mb-1">{formatPriceRange(product)}</p>

        {product.minOrderQuantity ? (
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">
            Min. Order — {product.minOrderQuantity} Pieces
          </p>
        ) : (
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">
            Min. Order — Contact Seller
          </p>
        )}

        <span
          onClick={(e) => {
            e.preventDefault()
            toast.success('Inquiry sent successfully to the supplier!')
          }}
          className="mt-auto w-full bg-[#006d44] hover:bg-[#005a36] text-white font-bold py-2.5 rounded-xl text-[11px] uppercase tracking-wider text-center transition-colors"
        >
          Send Inquiry
        </span>
      </Link>
    </div>
  )
}
