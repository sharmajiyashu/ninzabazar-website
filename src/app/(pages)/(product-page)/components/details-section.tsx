'use client'
import React, { useState, useEffect } from 'react'
import Variants from './product-variants'
import { Button } from '@heroui/button'
import Gallery from './gallery-section'
import { StarRating } from '@/app/components/ui-utils/star-rating'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import useCartStore from '@/app/store/cart-store'
import { useSession } from 'next-auth/react'
import { ProductDataProps, UserProps, CartItem } from '@/app/types/type'
import { toast } from 'sonner'
import CurrencyFormatter from '@/app/components/ui-utils/currency-format'

// Extended ProductDataProps to include orderItems
interface ExtendedProductDataProps extends ProductDataProps {
  orderItems?: Array<{ quantity: number }>
}

const formatNumber = (num: number): string => {
  if (!num && num !== 0) return '0'

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }

  return num.toString()
}

const DetailsSection = () => {
  const params = useParams()
  const id = params.id as string
  const { data: session, status: sessionStatus } = useSession()
  const addToCart = useCartStore((state) => state.addToCart)
  const cart = useCartStore((state) => state.cart)
  console.log('Rendered Cart Items:', cart)
  const router = useRouter()

  const [selectedVariants, setSelectedVariants] = useState<{
    [title: string]: string
  }>({})
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartSynced, setCartSynced] = useState(false)

  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery<UserProps>({
    queryKey: ['buyerProfile', session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
    enabled: !!session?.user?.id,
  })

  // Get product details
  const { data: product, isLoading: productLoading } =
    useQuery<ExtendedProductDataProps>({
      queryKey: ['product', id],
      queryFn: async () => {
        const res = await axios.get(`/api/product-details/get?id=${id}`)
        console.log('Product data fetched:', res.data)
        return res.data
      },
    })

  // Sync cart with database
  const userId = user?.buyerProfile?.id
  useEffect(() => {
    if (userId && !cartSynced) {
      useCartStore
        .getState()
        .syncCartWithDatabase(userId)
        .then(() => {
          setCartSynced(true)
        })
        .catch((error) => {
          console.error('Failed to sync cart:', error)
          setCartSynced(true) // Set to true even on error to prevent infinite loading
        })
    }
  }, [userId, cartSynced])

  // Determine overall loading state
  const isLoading =
    sessionStatus === 'loading' ||
    productLoading ||
    (session?.user?.id && userLoading) ||
    (userId && !cartSynced)

  const defaultImage = product?.images?.find(
    (img: { isDefault?: boolean }) => img.isDefault
  )

  const avgRating = (): number => {
    if (!product?.reviews?.length) return 0

    const total = product.reviews.reduce(
      (total: number, review: { rating: number }) => total + review.rating,
      0
    )
    return total / product.reviews.length
  }

  const totalSold = (): number => {
    // First, check if totalPurchases exists on the product
    if (product?.totalPurchases !== undefined) {
      return product.totalPurchases
    }

    // Fall back to calculating from orderItems if available
    if (product?.orderItems?.length) {
      const total = product.orderItems.reduce(
        (total: number, orderItem: { quantity: number }) =>
          total + orderItem.quantity,
        0
      )
      return total
    }

    return 0
  }

  const getPrice = (): number => {
    if (!product) return 0

    // If there are selected variants with pricing, calculate variant price
    const selectedVariantIds = Object.values(selectedVariants)
    if (selectedVariantIds.length > 0 && product.variants) {
      const variantPricing = selectedVariantIds.reduce((total, variantId) => {
        const variant = product.variants.find((v) => v.id === variantId)
        return (
          total +
          (variant?.hasPrice && variant.price ? Number(variant.price) : 0)
        )
      }, 0)

      if (variantPricing > 0) {
        const basePrice = product.salePrice || product.basePrice
        return Number(basePrice) + variantPricing
      }
    }

    // Return sale price if available, otherwise base price
    return Number(product.salePrice || product.basePrice || 0)
  }

  const getSelectedVariantCombination = (): string[] => {
    // Return array of selected variant IDs
    return Object.values(selectedVariants).filter(Boolean)
  }

  const getVariantTitles = (): string[] => {
    if (!product?.variants) return []

    // Get unique variant titles
    return [...new Set(product.variants.map((v) => v.title))]
  }

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, prev + change))
  }

  const handleAddToCart = async () => {
    if (!product || !session?.user) {
      toast?.error('Please log in to add items to cart')
      return
    }

    // Check if all required variants are selected
    const variantTitles = getVariantTitles()

    if (variantTitles.length > 0) {
      const allSelected = variantTitles.every(
        (title) => selectedVariants[title]
      )
      if (!allSelected) {
        toast?.warning('Please select all product variants')
        return
      }
    }

    if (!user?.buyerProfile?.id) {
      toast?.error('User profile not found')
      return
    }

    const variantCombination = getSelectedVariantCombination()

    try {
      if (!session.user) {
        router.push('/login')
        return
      }
      setIsAddingToCart(true)
      console.log(variantCombination)

      const cartItem: CartItem = {
        id: '', // This will be generated by the backend
        buyerId: user?.buyerProfile.id || '',
        productId: String(product.id),
        name: product.name,
        variantId:
          variantCombination.length > 0 ? variantCombination[0] : undefined,
        quantity: quantity,
        isSale: product.isSale,
        salePrice: product.salePrice || 0,
        basePrice: product.basePrice,
        seller: product.seller,
        images: defaultImage?.urlpath || '',
        variantCombination: variantCombination,
        variants: product.variants || [],
      }

      await addToCart(cartItem, user?.buyerProfile.id || '')

      toast?.success(`${product.name} added to cart successfully!`)
      console.log('Added to cart:', {
        productId: product.id,
        variantCombination: variantCombination,
        quantity: quantity,
      })
      setSelectedVariants({})
      setQuantity(1)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toast?.error('Failed to add product to cart. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product || !session?.user) {
      toast?.error('Please log in to Buy')
      return
    }

    const variantTitles = getVariantTitles()

    if (variantTitles.length > 0) {
      const allSelected = variantTitles.every(
        (title) => selectedVariants[title]
      )
      if (!allSelected) {
        toast?.warning('Please select all product variants')
        return
      }
    }

    if (!user?.buyerProfile?.id) {
      toast?.error('User profile not found')
      return
    }

    const variantCombination = getSelectedVariantCombination()

    const cartItem: CartItem = {
      id: '',
      buyerId: user?.buyerProfile.id || '',
      productId: String(product.id),
      name: product.name,
      variantId:
        variantCombination.length > 0 ? variantCombination[0] : undefined,
      quantity: quantity,
      isSale: product.isSale,
      salePrice: product.salePrice || 0,
      basePrice: product.basePrice,
      seller: product.seller,
      images: defaultImage?.urlpath || '',
      variantCombination: variantCombination,
      variants: product.variants || [],
      product: product,
    }

    useCartStore.getState().setBuyNowItem(cartItem)

    sessionStorage.setItem('checkoutType', 'buyNow')
    sessionStorage.setItem('checkoutItems', JSON.stringify([cartItem]))

    router.push('/checkout')
  }

  // Show loading screen while any data is being fetched
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 mb-4 border-4 rounded-full border-green border-t-transparent animate-spin"></div>
          <span className="text-lg text-gray-600">Loading product...</span>
        </div>
      </div>
    )
  }

  // Show error state if product is not found after loading is complete
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-lg text-gray-600">Product not found</span>
      </div>
    )
  }

  // Render the main content only after all data is loaded
  return (
    <div className="flex flex-col justify-center lg:flex-row">
      <div className="flex-none w-full lg:w-auto">
        <Gallery />
      </div>
      <div className="flex flex-col px-4 mt-6 lg:px-20 lg:mt-0">
        <span className="text-[24px] lg:text-[32px] font-semibold pt-6 lg:pt-24">
          {product.name}
        </span>
        <div className="flex items-center mt-2 space-x-2 md:mt-0">
          <span className="text-[14px] lg:text-[16px] text-disabledgrey">
            {avgRating().toFixed(1)}
          </span>
          <span className="text-disabledgrey"> | </span>

          <div className="flex items-center gap-x-2">
            <StarRating rating={avgRating()} />
            <span className="text-disabledgrey text-[14px] lg:text-[16px]">
              {formatNumber(product.reviews?.length || 0)} Ratings
            </span>
          </div>
          <span className=" text-disabledgrey"> | </span>
          <span className="text-disabledgrey text-[14px] lg:text-[16px]">
            {formatNumber(totalSold())} Sold
          </span>
        </div>
        <div className="flex flex-col items-start pt-2 md:flex-row md:items-center md:mt-6 md:justify-between">
          <span className="text-orange-400 text-[24px] lg:text-[28px] font-semibold">
            <CurrencyFormatter amount={getPrice()} />
          </span>
          <span>{/* <LikeAndShare /> */}</span>
        </div>

        {/* Variants Section */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-col mt-6 lg:mt-10">
            <span className="text-disabledgrey font-semibold text-[15px] lg:text-[17px]">
              Variants
            </span>
            <span>
              <Variants
                selectedVariants={selectedVariants}
                setSelectedVariants={setSelectedVariants}
              />
            </span>
          </div>
        )}

        {/* Quantity Section */}
        <div className="flex flex-row items-center pt-6 space-x-3 lg:pt-10">
          <a className="text-md lg:text-lg text-disabledgrey">Quantity:</a>
          <span className="flex flex-row items-center mx-2 border-disabledgrey">
            <Button
              className="border rounded-full border-disabledgrey hover:bg-disabledgrey hover:text-white"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="px-6 text-[14px] lg:text-md">{quantity}</span>
            <Button
              className="border rounded-full border-disabledgrey hover:bg-disabledgrey hover:text-white"
              onClick={() => handleQuantityChange(1)}
            >
              +
            </Button>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full mt-6 space-y-4 lg:mt-10">
          <Button
            onClick={handleBuyNow}
            className="py-6 font-semibold text-white border-2 rounded-full bg-green border-green hover:bg-green-800"
          >
            Buy Now
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !session?.user}
            className="py-6 font-semibold border-2 rounded-full text-green border-green hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? 'Adding...' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DetailsSection
