import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma' // Adjust path as needed
import { authOptions } from '@/lib/authOptions'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cart } = await request.json()

    if (!Array.isArray(cart)) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 })
    }

    // Find or create buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile) {
      return NextResponse.json(
        { error: 'Buyer profile not found' },
        { status: 404 }
      )
    }

    // Find or create cart
    let userCart = await prisma.cart.findUnique({
      where: { buyerId: buyerProfile.id },
      include: { items: true },
    })

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { buyerId: buyerProfile.id },
        include: { items: true },
      })
    }

    // Get all existing cart items for this user to check for duplicates
    const existingItems = await prisma.cartItem.findMany({
      where: { cartId: userCart.id },
    })

    // Helper function to compare variant combinations
    const arraysEqual = (a: string[] = [], b: string[] = []): boolean => {
      if (a.length !== b.length) return false
      return a.sort().every((val, index) => val === b.sort()[index])
    }

    // Process cart items
    if (cart.length > 0) {
      for (const item of cart) {
        // Validate required fields
        if (!item.productId || !item.name || item.basePrice === undefined) {
          return NextResponse.json(
            { error: 'Missing required fields: productId, name, or basePrice' },
            { status: 400 }
          )
        }

        // Get product details to populate missing fields if needed
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            basePrice: true,
            isSale: true,
            salePrice: true,
            sellerId: true,
          },
        })

        if (!product) {
          return NextResponse.json(
            { error: `Product not found: ${item.productId}` },
            { status: 404 }
          )
        }

        // Check if item already exists by comparing productId and variantCombination
        const existingItem = existingItems.find(
          (existing) =>
            existing.productId === item.productId &&
            arraysEqual(
              existing.variantCombination,
              item.variantCombination ?? []
            )
        )

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: item.quantity || 1, // Set to the exact quantity from the cart
              name: item.name || product.name,
              variantId: item.variantId || null,
              isSale: item.isSale ?? product.isSale,
              salePrice: item.salePrice || product.salePrice,
              basePrice: item.basePrice || product.basePrice,
              images: item.images,
            },
          })
        } else {
          // Create new cart item
          await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              buyerId: buyerProfile.id,
              productId: item.productId,
              variantCombination: item.variantCombination ?? [],
              quantity: item.quantity || 1,
              name: item.name || product.name,
              variantId: item.variantId || null,
              isSale: item.isSale ?? product.isSale,
              salePrice: item.salePrice || product.salePrice,
              basePrice: item.basePrice || product.basePrice,
              images: item.images,
              sellerId: product.sellerId,
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart sync error:', error)
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 })
  }
}
