import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { message: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { id: userId },
      include: {
        products: {
          skip,
          take: limit,
          include: {
            reviews: { select: { id: true, rating: true } },
            images: { select: { urlpath: true, isDefault: true } },
          },
        },
        storeRatingSummary: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    })

    const sellerId = sellerProfile?.id

    const totalProducts = await prisma.product.count({
      where: { sellerId: sellerId },
    })

    return NextResponse.json({
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      ...sellerProfile,
    })
  } catch (error) {
    console.error('Error in getSellerProfile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
