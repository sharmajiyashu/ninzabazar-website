import prisma from '@/lib/prisma'
import { liveProductWhere } from '@/lib/product-status'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '12')
    const liveWhere = liveProductWhere()

    const existingProducts = await prisma.product.findMany({
      where: liveWhere,
      select: { id: true },
      take: 100,
    })

    if (existingProducts.length === 0) {
      return NextResponse.json([])
    }

    const shuffled = existingProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, limit)
      .map((p) => p.id)

    const products = await prisma.product.findMany({
      where: {
        id: { in: shuffled },
        ...liveWhere,
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
