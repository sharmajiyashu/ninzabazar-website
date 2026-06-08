'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import useCartStore from '@/app/store/cart-store'
import { CartItem } from '@/app/types/type'
import ProductBreadcrumb from './product-breadcrumb'
import ProductSellerSidebar from './product-seller-sidebar'
import ProductSpecificationsGrid from './product-specifications-grid'
import RelatedProducts from './related-products-section'
import ContactSellerModal from './contact-seller-modal'
import Variants from './product-variants'
import {
  buildVariantCombination,
  getCartItemUnitPrice,
  getVariantTitles,
} from '@/lib/cart-utils'

type ProductSpec = { key: string; value: string }
type ProductColor = { id: string; name: string; hexCode?: string | null }

type ProductDetail = {
  id: string
  name: string
  description: string
  basePrice: number | string
  salePrice?: number | string | null
  isSale?: boolean
  minOrderQuantity?: number | null
  inventory?: number
  images?: { id?: string; urlpath: string; isDefault?: boolean; alt?: string }[]
  variants?: { id: string; title: string; option: string; price: number | string; hasPrice?: boolean }[]
  category?: { name: string } | null
  subCategory?: { name: string } | null
  colors?: ProductColor[]
  specifications?: ProductSpec[]
  seller: React.ComponentProps<typeof ProductSellerSidebar>['seller']
}

function formatInr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

function getPriceRange(product: ProductDetail) {
  const prices = [Number(product.basePrice)]
  if (product.isSale && product.salePrice) prices.push(Number(product.salePrice))
  product.variants?.forEach((v) => {
    if (v.hasPrice) prices.push(Number(v.price))
  })
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return formatInr(min)
  return `${formatInr(min)} — ${formatInr(max)}`
}

function getSellerLocation(seller: ProductDetail['seller']) {
  const addr = seller.registeredAddress
  if (!addr) return ''
  return [seller.companyName, addr.city, addr.state].filter(Boolean).join(' ')
}

export default function ProductDetailsLayout() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { data: session } = useSession()
  const addToCart = useCartStore((s) => s.addToCart)
  const setBuyNowItem = useCartStore((s) => s.setBuyNowItem)

  const { data: product, isLoading } = useQuery<ProductDetail>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await axios.get(`/api/product-details/get?id=${id}`)
      return res.data
    },
  })

  const [mainImage, setMainImage] = useState('')
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [contactQuantity, setContactQuantity] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  useEffect(() => {
    if (product?.minOrderQuantity) {
      setQuantity(product.minOrderQuantity)
    }
  }, [product?.minOrderQuantity])

  const defaultImage = useMemo(
    () => product?.images?.find((img) => img.isDefault) || product?.images?.[0],
    [product?.images]
  )

  useEffect(() => {
    if (defaultImage?.urlpath) setMainImage(defaultImage.urlpath)
  }, [defaultImage?.urlpath])

  useEffect(() => {
    if (product?.colors?.length && !selectedColorId) {
      setSelectedColorId(product.colors[0].id)
    }
  }, [product?.colors, selectedColorId])

  const selectedColorName =
    product?.colors?.find((c) => c.id === selectedColorId)?.name || ''

  const openContactModal = (opts?: { quantity?: number }) => {
    setContactQuantity(opts?.quantity ?? quantity)
    setContactOpen(true)
  }

  const validateSelections = (): boolean => {
    const variantTitles = getVariantTitles(product?.variants)
    if (variantTitles.length > 0) {
      const allSelected = variantTitles.every((title) => selectedVariants[title])
      if (!allSelected) {
        toast.error('Please select all product variants')
        return false
      }
    }
    if (product?.colors?.length && !selectedColorId) {
      toast.error('Please select a color')
      return false
    }
    return true
  }

  const buildCartItem = (buyerId: string): CartItem => {
    const variantCombination = buildVariantCombination(selectedVariants, selectedColorId)
    const unitPrice = getCartItemUnitPrice({
      basePrice: Number(product!.basePrice),
      salePrice: product!.salePrice != null ? Number(product!.salePrice) : null,
      isSale: product!.isSale,
      variants: product!.variants,
      variantCombination,
    })

    return {
      id: '',
      buyerId,
      productId: product!.id,
      name: product!.name,
      variantId: variantCombination.find((id) => !id.startsWith('color:')) || undefined,
      quantity,
      isSale: product!.isSale || false,
      salePrice: product!.isSale && product!.salePrice ? unitPrice : Number(product!.salePrice || 0),
      basePrice: unitPrice,
      seller: product!.seller as CartItem['seller'],
      sellerId: product!.seller.id,
      images: defaultImage?.urlpath || '',
      variantCombination,
      variants: product!.variants || [],
      product: product as CartItem['product'],
    }
  }

  const handleAddToCart = async () => {
    if (!product || !session?.user) {
      toast.error('Please log in to add items to cart')
      router.push('/login')
      return
    }
    if (!validateSelections()) return

    try {
      setIsAdding(true)
      const userRes = await axios.get(`/api/getUser?id=${session.user.id}`)
      const buyerId = userRes.data?.buyerProfile?.id
      if (!buyerId) {
        toast.error('Buyer profile not found')
        return
      }
      await addToCart(buildCartItem(buyerId), buyerId)
      toast.success(`${product.name} added to cart`)
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product || !session?.user) {
      toast.error('Please log in to checkout')
      router.push('/login')
      return
    }
    if (!validateSelections()) return

    try {
      const userRes = await axios.get(`/api/getUser?id=${session.user.id}`)
      const buyerId = userRes.data?.buyerProfile?.id
      if (!buyerId) {
        toast.error('Buyer profile not found')
        return
      }
      const cartItem = buildCartItem(buyerId)
      setBuyNowItem(cartItem)
      sessionStorage.setItem('checkoutType', 'buyNow')
      sessionStorage.setItem('checkoutItems', JSON.stringify([cartItem]))
      router.push('/checkout')
    } catch {
      toast.error('Failed to proceed to checkout')
    }
  }

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#006d44] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page-container py-20 text-center text-gray-500">
        Product not found
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-up pb-12">
      <ProductBreadcrumb
        category={product.category}
        subCategory={product.subCategory}
        productName={product.name}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Gallery */}
        <div className="flex gap-3 w-full lg:w-auto shrink-0">
          <div className="hidden sm:flex flex-col gap-2 w-20">
            {product.images?.map((img, i) => (
              <button
                key={img.id || i}
                type="button"
                onClick={() => setMainImage(img.urlpath)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  mainImage === img.urlpath ? 'border-[#006d44]' : 'border-gray-200'
                }`}
              >
                <Image src={img.urlpath} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-[340px] lg:w-[380px] aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            {mainImage && (
              <Image src={mainImage} alt={product.name} fill className="object-contain p-4" priority />
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
            {product.name}
          </h1>

          <p className="text-2xl font-bold text-[#2066d2] mt-3">{getPriceRange(product)}</p>

          <p className="text-sm text-gray-500 mt-2">{getSellerLocation(product.seller)}</p>

          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-800 mb-3">Color</p>
              <div className="flex flex-wrap gap-4">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorId(color.id)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span
                      className={`w-10 h-10 rounded-full border-2 ${
                        selectedColorId === color.id ? 'border-[#006d44]' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.hexCode || '#e5e7eb' }}
                    />
                    <span className="text-xs text-gray-600">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.variants && product.variants.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-800 mb-3">Variants</p>
              <Variants
                selectedVariants={selectedVariants}
                setSelectedVariants={setSelectedVariants}
              />
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-800 mb-3">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(product.minOrderQuantity || 1, q - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold"
              >
                −
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold"
              >
                +
              </button>
              <span className="text-xs text-gray-500">Pieces</span>
            </div>
          </div>

          {product.minOrderQuantity ? (
            <p className="text-xs text-gray-500 mt-4 font-semibold uppercase tracking-wide">
              Min. Order — {product.minOrderQuantity} Pieces
            </p>
          ) : null}

          {product.inventory != null && product.inventory > 0 && (
            <p className="text-xs text-gray-500 mt-1">In stock: {product.inventory} units</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 py-3 rounded-xl bg-[#006d44] hover:bg-[#005a36] text-white font-bold text-sm transition-colors"
            >
              Buy Now
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 py-3 rounded-xl border-2 border-[#006d44] text-[#006d44] font-bold text-sm hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add To Cart'}
            </button>
            <button
              type="button"
              onClick={() => openContactModal()}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors sm:max-w-[140px]"
            >
              Inquiry
            </button>
          </div>

          {product.description && (
            <div className="mt-8 hidden lg:block">
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Seller sidebar */}
        <ProductSellerSidebar
          productId={product.id}
          productName={product.name}
          seller={product.seller}
          minOrderQuantity={product.minOrderQuantity}
          onContact={openContactModal}
        />
      </div>

      <ContactSellerModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        productId={product.id}
        productName={product.name}
        sellerId={product.seller.id}
        defaultQuantity={contactQuantity}
        defaultColor={selectedColorName}
        colors={product.colors || []}
      />

      {product.description && (
        <div className="mt-8 lg:hidden">
          <h3 className="font-bold text-gray-900 mb-2">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      <ProductSpecificationsGrid specifications={product.specifications || []} />

      <RelatedProducts />
    </div>
  )
}
