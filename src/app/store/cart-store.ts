import { create } from 'zustand'
import { CartItem } from '../types/type'
import axios from 'axios'

interface CartState {
  cart: CartItem[]
  isLoading: boolean
  error: string | null
  selectedShippingMethods: Record<string, { name: string; price: number }>

  //Direct Buy Actions
  buyNowItem: CartItem | null
  setBuyNowItem: (item: CartItem) => void
  clearBuyNowItem: () => void

  // Cart actions
  addToCart: (item: CartItem, userId: string) => Promise<void>
  removeFromCart: (
    productId: string,
    variantCombination: string[],
    userId: string
  ) => Promise<void>

  incrementQuantity: (id: string, userId: string) => Promise<void>

  decrementQuantity: (
    id: string,
    productId: string,
    variantCombination: string[],
    userId: string
  ) => Promise<void>

  // Cart getters
  getQuantity: (productId: string, variantCombination?: string[]) => number

  // Cart management
  clearCart: (userId: string) => Promise<void>
  fetchCart: (userId: string) => Promise<void>

  // Sync cart with database
  syncCartWithDatabase: (userId: string) => Promise<void>

  // Shipping methods management
  setShippingMethod: (
    cartItemId: string,
    method: { name: string; price: number }
  ) => void
  getShippingSubtotal: () => number
  clearShippingMethods: () => void
}

const useCartStore = create<CartState>()((set, get) => ({
  cart: [],
  isLoading: false,
  error: null,
  selectedShippingMethods: {},

  // Direct Buy
  buyNowItem: null,
  setBuyNowItem: (item) => set({ buyNowItem: item }),
  clearBuyNowItem: () => set({ buyNowItem: null }),

  addToCart: async (item: CartItem, userId: string) => {
    try {
      set({ isLoading: true, error: null })

      const currentCart = get().cart

      // Find existing item with same productId and variant combination
      const existingItemIndex = currentCart.findIndex(
        (cartItem) =>
          cartItem.productId === item.productId &&
          JSON.stringify(cartItem.variantCombination?.sort()) ===
            JSON.stringify(item.variantCombination?.sort())
      )

      let updatedCart: CartItem[]
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedCart = [...currentCart]
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + item.quantity,
        }
      } else {
        // Add new item
        updatedCart = [...currentCart, { ...item }]
      }

      // Update local state first for immediate UI feedback
      set({ cart: updatedCart })

      // Save to database
      await saveCartToDatabase([...updatedCart])
      // Fetch fresh data from database to ensure sync
      await get().syncCartWithDatabase(userId)

      set({ isLoading: false })
      console.log('Updated cart items:', get().cart)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add to cart'
      set({ error: errorMessage, isLoading: false })
      console.error('Failed to add to cart:', error)
      throw error
    }
  },

  removeFromCart: async (
    productId: string,
    variantCombination: string[],
    userId: string
  ) => {
    try {
      set({ isLoading: true, error: null })

      // Update local state first for immediate UI feedback
      const currentCart = get().cart
      const updatedCart = currentCart.filter(
        (item) =>
          !(
            item.productId === productId &&
            JSON.stringify(item.variantCombination?.sort()) ===
              JSON.stringify(variantCombination?.sort())
          )
      )

      // Also remove shipping method for removed items
      const currentShippingMethods = get().selectedShippingMethods
      const itemToRemove = currentCart.find(
        (item) =>
          item.productId === productId &&
          JSON.stringify(item.variantCombination?.sort()) ===
            JSON.stringify(variantCombination?.sort())
      )

      if (itemToRemove?.id) {
        const updatedShippingMethods = { ...currentShippingMethods }
        delete updatedShippingMethods[itemToRemove.id]
        set({ selectedShippingMethods: updatedShippingMethods })
      }

      set({ cart: updatedCart })

      await deleteItemFromDatabase(productId, variantCombination)

      // Sync with database
      await get().syncCartWithDatabase(userId)

      set({ isLoading: false })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove from cart'
      set({ error: errorMessage, isLoading: false })
      console.error('Failed to remove from cart:', error)
      throw error
    }
  },

  incrementQuantity: async (id: string, userId: string) => {
    try {
      const currentCart = get().cart
      console.log('current cart from incrementStore: ', currentCart)

      const itemIndex = currentCart.findIndex((item) => item.id === id)
      if (itemIndex === -1) return

      const newQuantity = currentCart[itemIndex].quantity + 1

      // Update local state first
      const updatedCart = [...currentCart]
      updatedCart[itemIndex] = {
        ...updatedCart[itemIndex],
        quantity: newQuantity,
      }
      set({ cart: updatedCart })

      // Update backend
      await updateQTYToDatabase(id, newQuantity)

      // Sync with database
      await get().syncCartWithDatabase(userId)
    } catch (error) {
      console.error('Failed to increment quantity:', error)
      throw error
    }
  },

  decrementQuantity: async (
    id: string,
    productId: string,
    variantCombination: string[],
    userId: string
  ) => {
    try {
      const currentCart = get().cart
      const itemIndex = currentCart.findIndex((item) => item.id === id)
      if (itemIndex === -1) return

      const item = currentCart[itemIndex]
      if (item.quantity <= 1) {
        // If quantity is 1 or less, remove the item entirely
        await get().removeFromCart(productId, variantCombination, userId)
      } else {
        // Otherwise just decrement the quantity
        const newQuantity = item.quantity - 1

        // Update local state first
        const updatedCart = [...currentCart]
        updatedCart[itemIndex] = {
          ...updatedCart[itemIndex],
          quantity: newQuantity,
        }
        set({ cart: updatedCart })

        await updateQTYToDatabase(id, newQuantity)

        // Sync with database
        await get().syncCartWithDatabase(userId)
      }
    } catch (error) {
      console.error('Failed to decrement quantity:', error)
      throw error
    }
  },

  getQuantity: (productId: string, variantCombination?: string[]) => {
    const currentCart = get().cart

    const item = currentCart.find(
      (item) =>
        item.productId === productId &&
        JSON.stringify(item.variantCombination?.sort()) ===
          JSON.stringify((variantCombination || []).sort())
    )
    return item ? item.quantity : 0
  },

  clearCart: async (userId: string) => {
    try {
      set({ isLoading: true, error: null })
      await fetch(`/api/cart/clear?userId=${userId}`, {
        method: 'DELETE',
      })
      set({ cart: [], selectedShippingMethods: {}, isLoading: false })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to clear cart'
      set({ error: errorMessage, isLoading: false })
      console.error('Failed to clear cart:', error)
      throw error
    }
  },

  fetchCart: async (userId: string) => {
    try {
      if (!userId) {
        console.log('No userId provided to fetchCart')
        return
      }

      set({ isLoading: true, error: null })
      console.log('Fetching cart for userId[CARTSTORE]:', userId)

      const cartItems = await fetchCartFromDatabase(userId)
      console.log('Fetched cart items[CARTSTORE]:', cartItems)

      set({ cart: cartItems, isLoading: false })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch cart'
      set({ error: errorMessage, isLoading: false })
      console.error('Failed to fetch cart:', error)
      throw error
    }
  },

  syncCartWithDatabase: async (userId: string) => {
    try {
      // Get current user session to fetch cart
      const response = await fetch(`/api/cart/get?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to sync cart')

      const data = await response.json()
      const cartItems = data.cart || []

      set({ cart: cartItems })
    } catch (error) {
      console.error('Failed to sync cart with database:', error)
    }
  },

  // New shipping methods functions
  setShippingMethod: (
    cartItemId: string,
    method: { name: string; price: number }
  ) => {
    const currentMethods = get().selectedShippingMethods
    set({
      selectedShippingMethods: {
        ...currentMethods,
        [cartItemId]: method,
      },
    })
  },

  getShippingSubtotal: () => {
    const selectedMethods = get().selectedShippingMethods
    return Object.values(selectedMethods).reduce(
      (total, method) => total + method.price,
      0
    )
  },

  clearShippingMethods: () => {
    set({ selectedShippingMethods: {} })
  },
}))

// Database functions - updated to work with CartItem[] structure
async function saveCartToDatabase(cartItems: CartItem[]) {
  const response = await fetch('/api/cart/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cart: cartItems }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `Failed to save cart: ${response.status}`
    )
  }

  return response.json()
}

async function fetchCartFromDatabase(userId: string): Promise<CartItem[]> {
  const response = await fetch(`/api/cart/get?userId=${userId}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `Failed to fetch cart: ${response.status}`
    )
  }

  const data = await response.json()
  console.log('Raw cart data from API:', data.cart) // Debug log

  // Return the items array from the cart object
  return data.cart?.items || data.cart || []
}

async function updateQTYToDatabase(id: string, quantity: number) {
  try {
    const response = await axios.patch(
      '/api/cart/patch',
      {
        id,
        quantity,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
    // eslint-disable-next-line
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      `Failed to update quantity: ${error?.response?.status || ''}`
    throw new Error(errorMessage)
  }
}

async function deleteItemFromDatabase(
  productId: string,
  variantCombination: string[]
) {
  try {
    const response = await axios.delete('/api/cart/delete', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        productId,
        variantCombination,
      },
    })
    return response.data
    // eslint-disable-next-line
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      `Failed to delete item: ${error?.response?.status || ''}`
    throw new Error(errorMessage)
  }
}

export default useCartStore
