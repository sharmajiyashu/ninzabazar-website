import CurrencyFormatter from '@/app/components/ui-utils/currency-format'
import useCartStore from '@/app/store/cart-store'
import { formatVariantCombinationLabel, getCartItemUnitPrice } from '@/lib/cart-utils'
import { CartItem } from '@/app/types/type'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Minus, Plus, Trash } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export const ProductCell = ({ product }: { product: CartItem }) => {
  const { data: productQ } = useQuery({
    queryKey: ['product', product.productId],
    queryFn: async () => {
      const res = await axios.get(
        `/api/product-details/get?id=${product.productId}`
      )
      console.log(res.data)
      return res.data
    },
  })
  return (
    <div className="flex items-start space-x-4">
      <div className="flex flex-col w-full">
        <div className="flex flex-row gap-x-4 mb-2">
          {product.isSale && (
            <div className="bg-red-600 text-white text-xs px-2 py-1 rounded">
              SALE!
            </div>
          )}
          {product && (
            <div className="text-sm font-medium">
              {productQ?.seller.companyName}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="h-16 w-16 flex-shrink-0">
            <Image
              width={64}
              height={64}
              src={product.images}
              alt={`${product.name} Image` || 'Product Image'}
              className="h-full w-full object-contain rounded"
            />
          </div>

          <div className="flex-1">
            <div className="font-medium text-sm">{product.name}</div>
            {product.variantCombination?.length > 0 && (
              <div className="text-sm text-gray-500 mt-1">
                {formatVariantCombinationLabel(
                  product.variantCombination,
                  product.variants?.length ? product.variants : productQ?.variants,
                  productQ?.colors
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const PriceCell = ({
  salePrice,
  basePrice,
}: {
  salePrice: number
  basePrice: number
}) => {
  const formattedSalePrice = <CurrencyFormatter amount={salePrice} />
  const formattedOriginalPrice = <CurrencyFormatter amount={basePrice} />

  return (
    <div className="text-left">
      {salePrice > 0 && salePrice !== basePrice ? (
        <>
          <div className="text-gray-400 line-through text-sm">
            {formattedOriginalPrice}
          </div>
          <div className="font-medium text-red-600">{formattedSalePrice}</div>
        </>
      ) : (
        <div className="font-medium">{formattedOriginalPrice}</div>
      )}
    </div>
  )
}

export const QuantityCell = ({
  id,
  productId,
  quantity,
  variantCombination = [],
  userId,
}: {
  id: string
  productId: string
  quantity: number
  variantCombination?: string[]
  userId: string
}) => {
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Get cart functions from store
  const removeItem = useCartStore((state) => state.removeFromCart)
  const incrementQuantity = useCartStore((state) => state.incrementQuantity)
  const decrementQuantity = useCartStore((state) => state.decrementQuantity)
  const getQuantity = useCartStore((state) => state.getQuantity)

  // Get the actual quantity from the store - this is the source of truth
  const currentQuantity = getQuantity(productId, variantCombination)

  // Use store quantity if available, otherwise fall back to prop quantity
  const displayQuantity = currentQuantity > 0 ? currentQuantity : quantity

  const increment = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      await incrementQuantity(id, userId)
    } catch (error) {
      console.error('Failed to increment quantity:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const decrement = async () => {
    if (isUpdating) return

    if (displayQuantity <= 1) {
      setOpen(true)
    } else {
      setIsUpdating(true)
      try {
        await decrementQuantity(id, productId, variantCombination, userId)
      } catch (error) {
        console.error('Failed to decrement quantity:', error)
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      await removeItem(productId, variantCombination, userId)
      setOpen(false)
    } catch (error) {
      console.error('Failed to remove item:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-md"
        onClick={decrement}
        disabled={isUpdating}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="w-8 text-center font-medium">{displayQuantity}</div>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-md"
        onClick={increment}
        disabled={isUpdating}
      >
        <Plus className="h-4 w-4" />
      </Button>

      {/* Confirm Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove item from cart?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this item from your cart?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isUpdating}
            >
              {isUpdating ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const TotalPriceCell = ({ product }: { product: CartItem }) => {
  // Get quantity from store using the same method as QuantityCell
  const getQuantity = useCartStore((state) => state.getQuantity)

  // Get the actual quantity from the store using the same method as QuantityCell
  const storeQuantity = getQuantity(
    product.productId,
    product.variantCombination || []
  )

  const quantity = storeQuantity > 0 ? storeQuantity : product.quantity
  const unitPrice = getCartItemUnitPrice({
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice,
    isSale: product.isSale,
    variants: product.variants,
    variantCombination: product.variantCombination,
  })
  const totalPrice = unitPrice * (quantity || 1)

  // Format the total price
  const formattedTotalPrice = <CurrencyFormatter amount={totalPrice} />

  return (
    <div className="font-medium text-orange text-left">
      {formattedTotalPrice}
    </div>
  )
}

export const ActionsCell = ({
  productId,
  variantCombination = [],
  userId,
}: {
  productId: string
  variantCombination?: string[]
  userId: string
}) => {
  const removeItem = useCartStore((state) => state.removeFromCart)
  const [open, setOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await removeItem(productId, variantCombination, userId)
      setOpen(false)
    } catch (error) {
      console.error('Failed to remove item:', error)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="flex justify-start">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
        onClick={() => setOpen(true)}
        disabled={isRemoving}
      >
        <Trash className="h-4 w-4" />
      </Button>

      {/* Confirm Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove item from cart?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this item from your cart?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
