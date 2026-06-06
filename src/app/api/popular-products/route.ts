import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '28')

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
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
    })

    const productsWithRatings = products
      .map((product) => {
        const totalRating = product.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        )
        const averageRating =
          product.reviews.length > 0 ? totalRating / product.reviews.length : 0
        const reviewCount = product.reviews.length

        return {
          ...product,
          averageRating,
          reviewCount,
        }
      })
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating
        }
        return b.reviewCount - a.reviewCount
      })

      // Only include products with at least 1 review to be considered "popular"
      .filter((product) => product.reviewCount > 0)
      .slice(0, limit)

    // Remove the calculated fields before returning

    const popularProducts = productsWithRatings.map(
      // eslint-disable-next-line
      ({ averageRating, reviewCount, ...product }) => product
    )

    return NextResponse.json(popularProducts)
  } catch (error) {
    console.error('Error fetching popular products:', error)
    return NextResponse.json(
      { message: 'Failed to fetch popular products' },
      { status: 500 }
    )
  }
}
