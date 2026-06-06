import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { productId, incrementBy = 1 } = await req.json()

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get the current product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    // Update the totalSold count
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        totalPurchases: (product.totalPurchases || 0) + incrementBy,
      },
    })

    return NextResponse.json({
      message: 'Product sold count updated successfully',
      product: updatedProduct,
    })
  } catch (error) {
    console.error('Error updating product sold count:', error)
    return NextResponse.json(
      { message: 'Failed to update product sold count' },
      { status: 500 }
    )
  }
}
