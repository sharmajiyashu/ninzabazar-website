'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Package2, CreditCard, Truck, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { CartItem, RazorpayOptions, UserProps } from '@/app/types/type'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import useCartStore from '@/app/store/cart-store'
import CurrencyFormatter from '@/app/components/ui-utils/currency-format'
import { formatVariantCombinationLabel, getCartItemKey, getCartItemUnitPrice } from '@/lib/cart-utils'
import Image from 'next/image'
import razorPay from '../../../../../public/razor-pay.png'
import paypal from '../../../../../public/paypal.png'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import CheckoutAddressSelector from './components/checkout-address-selector'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void
    }
  }
}

function getCheckoutErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { details?: string; error?: string; message?: string }
      | undefined
    return data?.details || data?.error || data?.message || err.message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

const CheckoutPage = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [razorpayReady, setRazorpayReady] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const cartStore = useCartStore()
  const clearCart = useCartStore((state) => state.clearCart)
  const setShippingMethod = useCartStore((state) => state.setShippingMethod)
  const selectedShippingMethods = useCartStore(
    (state) => state.selectedShippingMethods
  )
  const getShippingSubtotal = useCartStore((state) => state.getShippingSubtotal)

  const { data: session } = useSession()
  const router = useRouter()

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        setRazorpayReady(true)
        return Promise.resolve(true)
      }

      return new Promise<boolean>((resolve) => {
        const existing = document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        )
        if (existing) {
          existing.addEventListener('load', () => {
            setRazorpayReady(true)
            resolve(true)
          })
          return
        }

        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          setRazorpayReady(true)
          resolve(true)
        }
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })
    }

    loadRazorpayScript()
  }, [])

  useEffect(() => {
    const checkoutItems = sessionStorage.getItem('checkoutItems')
    const checkoutType = sessionStorage.getItem('checkoutType')

    if (checkoutType === 'buyNow' && checkoutItems) {
      const parsedItem = JSON.parse(checkoutItems)[0]
      if (parsedItem) {
        cartStore.setBuyNowItem(parsedItem)
      }
    }

    setIsInitialized(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isBuyNow =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('checkoutType') === 'buyNow'

  const cart = useMemo(() => {
    if (!isInitialized) return []
    return isBuyNow && cartStore.buyNowItem
      ? [cartStore.buyNowItem]
      : cartStore.cart
  }, [isInitialized, isBuyNow, cartStore.buyNowItem, cartStore.cart])

  const { data: user, isLoading: isBuyerDetailsLoading, refetch: refetchUser } = useQuery<UserProps>({
    queryKey: ['user', session?.user.id],
    queryFn: async () => {
      const response = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return response.data
    },
    enabled: !!session?.user.id,
  })

  const userId = user?.buyerProfile?.id
  useEffect(() => {
    if (userId && !isBuyNow) {
      useCartStore.getState().fetchCart(userId)
    }
  }, [userId, isBuyNow])

  const addresses = useMemo(
    () => user?.buyerProfile?.shippingAddresses || [],
    [user?.buyerProfile?.shippingAddresses]
  )

  const selectedAddress = useMemo(() => {
    if (!addresses.length) return null
    return (
      addresses.find((addr) => addr.id === selectedAddressId) ||
      addresses.find((addr) => addr.isDefault) ||
      addresses[0]
    )
  }, [addresses, selectedAddressId])

  useEffect(() => {
    if (!addresses.length) {
      setSelectedAddressId(null)
      return
    }

    if (selectedAddressId && addresses.some((addr) => addr.id === selectedAddressId)) {
      return
    }

    const initial =
      addresses.find((addr) => addr.isDefault) || addresses[0]
    setSelectedAddressId(initial.id)
  }, [addresses, selectedAddressId])

  const handleAddressSaved = async () => {
    const { data: updatedUser } = await refetchUser()
    const updatedAddresses =
      updatedUser?.buyerProfile?.shippingAddresses || []

    if (updatedAddresses.length === 0) return

    const defaultAddr =
      updatedAddresses.find((addr) => addr.isDefault) ||
      updatedAddresses[updatedAddresses.length - 1]

    setSelectedAddressId(defaultAddr.id)
  }

  // Auto-select shipping so Place Order is not blocked
  useEffect(() => {
    if (!isInitialized || cart.length === 0) return

    const currentMethods = useCartStore.getState().selectedShippingMethods
    const newMethods = { ...currentMethods }
    let updated = false

    cart.forEach((item) => {
      const itemKey = getCartItemKey(item)
      if (newMethods[itemKey]) return

      const methods = item.product?.shippingMethods || []
      if (methods.length > 0) {
        newMethods[itemKey] = {
          name: methods[0].name,
          price: methods[0].price || 0,
        }
      } else {
        newMethods[itemKey] = { name: 'Standard Shipping', price: 0 }
      }
      updated = true
    })

    if (updated) {
      useCartStore.setState({ selectedShippingMethods: newMethods })
    }
  }, [isInitialized, cart])

  const handleShippingMethodChange = (
    cartItemId: string,
    methodName: string,
    item: CartItem
  ) => {
    const selectedMethod = item.product?.shippingMethods?.find(
      (method) => method.name === methodName
    )
    if (selectedMethod) {
      setShippingMethod(cartItemId, {
        name: selectedMethod.name,
        price: selectedMethod.price || 0,
      })
    }
  }

  const allShippingSelected = useMemo(
    () =>
      cart.every((item) => Boolean(selectedShippingMethods[getCartItemKey(item)])),
    [cart, selectedShippingMethods]
  )

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

    const shippingSubtotal = getShippingSubtotal()
    const total = subtotal + shippingSubtotal

    return {
      subtotal,
      totalItems,
      shippingSubtotal,
      total,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, selectedShippingMethods, getShippingSubtotal])

  const RazorPayOrder = async (amount: number) => {
    const res = await axios.post(`/api/payment/razorpay/create-order`, {
      amount,
      currency: 'INR',
    })
    return res.data
  }

  // eslint-disable-next-line
  const verifyPayment = async (paymentData: any) => {
    const res = await axios.post(`/api/payment/razorpay/verify`, paymentData)
    return res.data
  }
  // eslint-disable-next-line
  const handlePaymentSuccess = async (response: any) => {
    try {
      console.log('✅ Razorpay handler triggered', response)
      setIsProcessingPayment(true)
      const verificationResult = await verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      })

      if (!verificationResult.success) throw new Error('Verification failed')

      const orderItems = cart.map((item) => {
        const cartItemId = getCartItemKey(item)
        const shipping = selectedShippingMethods[cartItemId]
        const unitPrice = getCartItemUnitPrice({
          basePrice: Number(item.basePrice),
          salePrice: item.salePrice,
          isSale: item.isSale,
          variants: item.variants,
          variantCombination: item.variantCombination,
        })

        return {
          id: cartItemId,
          sellerId:
            item.sellerId ||
            item.product?.sellerId ||
            item.seller?.id ||
            item.product?.seller?.id ||
            '',
          quantity: item.quantity,
          priceAtPurchase: unitPrice,
          variantId:
            item.variantCombination?.find((v) => !v.startsWith('color:')) || item.variantId,
          productName: item.name,
          variantCombination: item.variantCombination || [],
          productId: item.productId,
          shippingMethodName: shipping?.name,
          shippingMethodPrice: shipping?.price || 0,
        }
      })

      const orderData = {
        userId: user?.buyerProfile?.id,
        items: orderItems,
        shippingMethods: selectedShippingMethods,
        totalAmount: cartTotals.total,
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        shippingAddress: selectedAddress,
      }

      const orderRes = await axios.post('/api/orders/create', orderData)

      if (orderRes.data.success) {
        await clearCart(user?.buyerProfile?.id || '')
        cartStore.clearBuyNowItem()
        cartStore.clearShippingMethods()
        sessionStorage.removeItem('checkoutItems')
        sessionStorage.removeItem('checkoutType')
        localStorage.setItem('orderId', orderRes.data.orderId || response.razorpay_order_id)
        router.push('/success')
      } else {
        throw new Error(orderRes.data.error || 'Failed to create order')
      }
      // eslint-disable-next-line
    } catch (err: any) {
      const msg = getCheckoutErrorMessage(err)
      setPaymentError(msg)
      toast.error(msg)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handlePlaceOrder = async () => {
    try {
      setPaymentError(null)

      if (!cart || cart.length === 0) {
        toast.error('Cart is empty')
        return
      }
      if (!user?.buyerProfile?.id) {
        toast.error('Please log in to place an order')
        return
      }
      if (!selectedAddress) {
        toast.error('Please add or select a shipping address')
        return
      }
      if (!allShippingSelected) {
        toast.error('Select shipping for all items')
        return
      }
      if (!razorpayReady || !window.Razorpay) {
        toast.error('Payment gateway is still loading. Please wait a moment.')
        return
      }
      if (cartTotals.total <= 0) {
        toast.error('Order total must be greater than zero')
        return
      }

      setIsProcessingPayment(true)

      const orderData = await RazorPayOrder(cartTotals.total)

      if (orderData.error) {
        throw new Error(orderData.details || orderData.error)
      }

      const razorpayKey =
        orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!razorpayKey || !orderData.id) {
        throw new Error('Payment could not be initialized. Please try again.')
      }

      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Ninja Bazaar',
        description: `Order for ${cartTotals.totalItems} items`,
        order_id: orderData.id,
        handler: handlePaymentSuccess,
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email || session?.user.email || '',
          contact: user.contactNumber?.replace(/\D/g, '').slice(-10) || '',
        },
        theme: {
          color: '#16a34a',
        },
        modal: {
          ondismiss: () => {
            setPaymentError('Payment cancelled')
            setIsProcessingPayment(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', (response) => {
        const msg = response.error?.description || 'Payment failed'
        setPaymentError(msg)
        toast.error(msg)
        setIsProcessingPayment(false)
      })

      setIsProcessingPayment(false)
      razorpay.open()
      // eslint-disable-next-line
    } catch (err: any) {
      const msg = getCheckoutErrorMessage(err)
      setPaymentError(msg)
      toast.error(msg)
      setIsProcessingPayment(false)
    }
  }

  const canPlaceOrder =
    cart.length > 0 &&
    Boolean(user) &&
    Boolean(selectedAddress) &&
    allShippingSelected &&
    razorpayReady &&
    !isProcessingPayment

  if (!isInitialized || isBuyerDetailsLoading || !session?.user.id) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-700" />
      </div>
    )
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-600">
          Cart data unavailable. Go back and try again.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order Information - Left Side */}
          <div className="flex-1 lg:w-3/5">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Start Order
                </h1>
              </div>

              <CheckoutAddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
                onAddressSaved={handleAddressSaved}
                userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                contactNumber={user?.contactNumber}
              />

              {/* Payment Method */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex flex-row justify-between items-start mb-4">
                  <div className="flex flex-row items-center gap-3">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Payment Method
                    </h2>
                  </div>
                </div>
                <div className="ml-9 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        id="razor-pay"
                        name="payment"
                        defaultChecked
                        className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                      />
                      <label
                        htmlFor="razor-pay"
                        className="flex items-center gap-3 text-lg cursor-pointer"
                      >
                        <Image
                          src={razorPay}
                          alt="Razor Pay"
                          width={30}
                          height={30}
                        />
                        Razor Pay
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        disabled
                        type="radio"
                        id="paypal"
                        name="payment"
                        className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                      />
                      <label
                        htmlFor="paypal"
                        className="flex items-center gap-3 text-lg cursor-pointer text-gray-400"
                      >
                        <Image
                          src={paypal}
                          alt="Paypal"
                          width={20}
                          height={20}
                        />
                        PayPal (Coming Soon)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Ordered */}
              <div className="pb-6">
                <div className="flex flex-row items-center gap-3 mb-4">
                  <Package2 className="w-6 h-6 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Products Ordered
                  </h2>
                </div>

                {cart.map((item, index) => {
                  const itemKey = getCartItemKey(item)
                  return (
                  <div
                    key={itemKey || index}
                    className="flex flex-col sm:flex-row gap-6 p-4 border border-gray-200 rounded-lg my-2 shadow-md"
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {item.images ? (
                          <Image
                            width={96}
                            height={96}
                            src={item.images}
                            alt={`${item.name} Image` || 'Product Image'}
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package2 className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex flex-col justify-center space-y-2 flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item?.name || 'Product Name'}
                        </h4>
                        {item.variantCombination?.length > 0 && (
                          <p className="text-sm text-gray-500">
                            {formatVariantCombinationLabel(
                              item.variantCombination,
                              item.variants || item.product?.variants,
                              item.product?.colors
                            )}
                          </p>
                        )}
                        <p className="text-orange-600 font-semibold">
                          <CurrencyFormatter
                            amount={getCartItemUnitPrice({
                              basePrice: Number(item.basePrice),
                              salePrice: item.salePrice,
                              isSale: item.isSale,
                              variants: item.variants,
                              variantCombination: item.variantCombination,
                            })}
                          />{' '}
                          x {item.quantity}
                        </p>
                        <div className="mt-3">
                          <h5 className="font-medium text-gray-700 mb-2">
                            Shipping Option
                          </h5>
                          {item.product?.shippingMethods &&
                          item.product.shippingMethods.length > 0 ? (
                            <Select
                              value={
                                selectedShippingMethods[itemKey]?.name ||
                                ''
                              }
                              onValueChange={(value) =>
                                handleShippingMethodChange(
                                  itemKey,
                                  value,
                                  item
                                )
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a shipping option" />
                              </SelectTrigger>
                              <SelectContent>
                                {item.product.shippingMethods.map((method) => (
                                  <SelectItem
                                    key={method.name}
                                    value={method.name}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span>{method.name}</span>
                                      <span className="ml-2">
                                        <CurrencyFormatter
                                          amount={method.price || 0}
                                        />
                                        {method.estimatedDays &&
                                          ` (${method.estimatedDays} days)`}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-gray-500 italic">
                              Standard shipping (free) will be applied
                            </p>
                          )}

                          {selectedShippingMethods[itemKey] && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                              <p className="text-sm text-green-800">
                                Selected:{' '}
                                {selectedShippingMethods[itemKey].name} -
                                <CurrencyFormatter
                                  amount={
                                    selectedShippingMethods[itemKey].price
                                  }
                                />
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:w-2/5">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Item Subtotal</span>
                  <span className="font-medium">
                    <CurrencyFormatter amount={cartTotals.subtotal} />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Shipping Fee</span>
                  <span className="font-medium">
                    {cartTotals.shippingSubtotal > 0 ? (
                      <CurrencyFormatter amount={cartTotals.shippingSubtotal} />
                    ) : (
                      <span className="text-gray-500">
                        Select shipping options
                      </span>
                    )}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-orange-600">
                    <CurrencyFormatter amount={cartTotals.total} />
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canPlaceOrder}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-lg">Processing...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-6 h-6" />
                    <span className="text-lg">Place Order</span>
                  </>
                )}
              </button>

              {!selectedAddress && user && (
                <p className="mt-3 text-sm text-red-600 text-center">
                  Add or select a shipping address to continue.
                </p>
              )}
              {paymentError && (
                <p className="mt-3 text-sm text-red-600 text-center">{paymentError}</p>
              )}
              {!razorpayReady && (
                <p className="mt-3 text-sm text-gray-500 text-center">
                  Loading payment gateway...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
// Future improvements:
// 1. Paypal integration
// 2. Use input checks to ensure which payment method is selected
