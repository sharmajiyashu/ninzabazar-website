import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, variantCombination } = await request.json()

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })
    console.log(buyerProfile?.id)

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

    // Find the specific cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId,
        variantCombination: {
          hasEvery: variantCombination ?? [],
        },
      },
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Remove the specific item by its unique id
    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove from cart error:', error)
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}
