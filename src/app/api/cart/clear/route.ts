import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 })
    }

    // Find the user's cart
    const userCart = await prisma.cart.findUnique({
      where: { buyerId: userId },
    })
    if (!userCart) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 })
    }

    // Delete all cart items for this cart
    const response = await prisma.cartItem.deleteMany({
      where: { cartId: userCart.id },
    })
    return NextResponse.json(response)
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
