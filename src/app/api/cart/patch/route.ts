import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, quantity } = await request.json()

    // Validate that id is provided
    if (!id) {
      return NextResponse.json(
        { error: 'Cart item ID is required' },
        { status: 400 }
      )
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile) {
      return NextResponse.json(
        { error: 'Buyer profile not found' },
        { status: 404 }
      )
    }

    const userCart = await prisma.cart.findUnique({
      where: { buyerId: buyerProfile.id },
    })

    if (!userCart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    // Update ONLY the specific item by its ID
    const updatedItem = await prisma.cartItem.updateMany({
      where: {
        id: id,
        cartId: userCart.id, // Additional security check
      },
      data: { quantity: Math.max(1, quantity) }, // Ensure quantity is at least 1
    })

    // Check if any item was actually updated
    if (updatedItem.count === 0) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update quantity error:', error)
    return NextResponse.json(
      { error: 'Failed to update quantity' },
      { status: 500 }
    )
  }
}
