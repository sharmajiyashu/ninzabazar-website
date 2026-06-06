import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '12')

    // Method 1: Random ID Selection (Most Efficient)
    const minMax = await prisma.product.aggregate({
      _min: { id: true },
      _max: { id: true },
      where: {
        isActive: true, // Only fetch active products
      },
    })

    if (!minMax._min.id || !minMax._max.id) {
      return NextResponse.json([])
    }

    const existingProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true },
      take: 100, // Get a pool to randomize from
    })

    const shuffled = existingProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, limit)
      .map((p) => p.id)

    const products = await prisma.product.findMany({
      where: {
        id: { in: shuffled },
        isActive: true,
        status: 'approved',
      },
      include: {
        images: {
          where: { isDefault: true },
          take: 1,
        },
        seller: {
          select: {
            companyName: true,
            shopName: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      take: limit,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching random products:', error)
    return NextResponse.json(
      { message: 'Failed to fetch random products' },
      { status: 500 }
    )
  }
}
