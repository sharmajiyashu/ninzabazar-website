import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get cart with all items and related data
    const userCart = await prisma.cartItem.findMany({
      where: { buyerId: userId || '' },
      include: {
        // Include product with its shipping methods
        product: {
          include: {
            images: true,
            seller: true,
            variants: {
              select: {
                id: true,
                title: true,
                option: true,
                price: true,
                hasPrice: true,
              },
            },
            shippingMethods: {
              where: { isActive: true },
            },
          },
        },
      },
    })

    if (!userCart) {
      // Return empty cart structure if no cart exists
      return NextResponse.json({
        cart: {
          id: '',
          buyerId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [],
        },
      })
    }

    return NextResponse.json({ cart: userCart })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}
