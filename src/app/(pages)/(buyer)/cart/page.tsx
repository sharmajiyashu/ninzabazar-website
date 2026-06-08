'use client'
import { useEffect, useMemo, useState } from 'react'
import { columns } from './columns'
import { DataTable } from './table'
import useCartStore from '@/app/store/cart-store'
import { Button } from '@/components/ui/button'
import CurrencyFormatter from '@/app/components/ui-utils/currency-format'
import { DialogHeader } from '@/components/ui/dialog'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { formatVariantCombinationLabel, getCartItemUnitPrice } from '@/lib/cart-utils'
import { CartItem, UserProps } from '@/app/types/type'
import { ShoppingCart, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  // Get cart and cart operations from Zustand store
  const { clearCart, removeFromCart, isLoading, error } = useCartStore()

  const cart = useCartStore((state) => state.cart)
  useEffect(() => {
    console.log('Cart updated in component:', cart)
  }, [cart])

  const [openClearCart, setOpenClearCart] = useState(false)
  const [openDeleteSelected, setOpenDeleteSelected] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const { data: session } = useSession()
  const router = useRouter()

  // Get user profile first
  const { data: user, isLoading: userLoading } = useQuery<UserProps>({
    queryKey: ['buyerProfile', session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
    enabled: !!session?.user?.id,
  })

  // Calculate cart totals
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum: number, item: CartItem) => {
      const price = getCartItemUnitPrice({
        basePrice: Number(item.basePrice),
        salePrice: item.salePrice,
        isSale: item.isSale,
        variants: item.variants,
        variantCombination: item.variantCombination,
      })
      return sum + price * item.quantity
    }, 0)

    const totalItems = cart.reduce(
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    )
    const totalUniqueItems = cart.length
    const total = subtotal

    return {
      subtotal,
      totalItems,
      totalUniqueItems,
      total,
    }
  }, [cart])

  // Handle deleting selected items
  const handleDeleteSelected = async () => {
    try {
      for (const rowId of selectedRows) {
        const cartItem = cart.find((item) => item.id === rowId)
        if (cartItem) {
          await removeFromCart(
            cartItem.productId,
            cartItem.variantCombination || [],
            user?.buyerProfile?.id || ''
          )
        }
      }
      setSelectedRows([])
      toast?.success(`${selectedRows.length} item(s) removed from cart`)
    } catch (error) {
      console.log(error)
      toast?.error('Failed to remove selected items')
    }
  }

  // handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast?.error('Your cart is empty')
      return
    }

    try {
      sessionStorage.setItem('checkoutType', 'cart')
      sessionStorage.removeItem('checkoutItems')
      router.push('/checkout')
    } catch (error) {
      console.log(error)
      toast?.error('Failed to proceed to checkout')
    }
  }

  // Handle clear cart
  const handleClearCart = async () => {
    try {
      await clearCart(user?.buyerProfile?.id || '')
      setOpenClearCart(false)
      setSelectedRows([])
      toast?.success('Cart cleared successfully')
    } catch (error) {
      console.log(error)
      toast?.error('Failed to clear cart')
    }
  }

  const userId = user?.buyerProfile?.id
  useEffect(() => {
    if (userId) {
      useCartStore.getState().syncCartWithDatabase(userId)
    }
  }, [userId])

  // Show loading state
  if (userLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center py-10">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-8 w-8 text-green" />
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {cartTotals.totalItems} items
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven&apos;t added any items to your cart yet.
          </p>
          <Button
            size="lg"
            className="bg-green hover:bg-green-800 text-white px-8"
            onClick={() => router.push('/')}
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Cart Items</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenDeleteSelected(true)}
                      disabled={selectedRows.length === 0}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedRows.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenClearCart(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>

              {/* Use your existing DataTable component */}
              <div className="p-6">
                <DataTable
                  columns={columns()}
                  data={cart}
                  onRowSelectionChange={setSelectedRows}
                  selectedRows={selectedRows}
                />
              </div>
            </div>
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              {/* List of items and their price */}
              <div className="mb-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center mb-2"
                  >
                    <span
                      className="truncate max-w-[120px] text-sm"
                      title={item.name}
                    >
                      {item.name}
                      {item.variantCombination
                        ? ` ${item.variantCombination}`
                        : ''}
                      {item.quantity > 1 ? ` x ${item.quantity}` : ''}
                    </span>
                    <span>
                      <CurrencyFormatter
                        amount={
                          (item.isSale && item.salePrice
                            ? item.salePrice
                            : item.basePrice) * item.quantity
                        }
                      />
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>
                      <CurrencyFormatter amount={cartTotals.total} />
                    </span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-green hover:bg-green-800 text-white mb-3"
                onClick={() => handleCheckout()}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => router.push('/')}
              >
                Continue Shopping
              </Button>

              {/* Cart Summary Stats */}
              <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                <div className="flex justify-between mb-1">
                  <span>Total Items:</span>
                  <span>{cartTotals.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unique Products:</span>
                  <span>{cartTotals.totalUniqueItems}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog for Clear Cart */}
      <Dialog open={openClearCart} onOpenChange={setOpenClearCart}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear your cart?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove all {cartTotals.totalItems} items
              from your cart? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpenClearCart(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearCart}
              disabled={isLoading}
            >
              {isLoading ? 'Clearing...' : 'Clear Cart'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog for Delete Selected */}
      <Dialog open={openDeleteSelected} onOpenChange={setOpenDeleteSelected}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove selected items?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedRows.length} selected
              item(s) from your cart?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpenDeleteSelected(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteSelected()
                setOpenDeleteSelected(false)
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Removing...' : 'Remove Items'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
