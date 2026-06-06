import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
  }
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('id')
  if (!productId) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 })
  }
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        reviews: {
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
            images: {
              select: {
                id: true,
                urlpath: true,
                alt: true,
                reviewId: true,
              },
            },
            createdAt: true,
          },
        },
        orderItems: {
          where: {
            order: {
              status: 'COMPLETED',
            },
          },
        },
        images: {
          select: {
            id: true,
            urlpath: true,
            alt: true,
            isDefault: true,
          },
        },
        variants: {
          select: {
            id: true,
            title: true,
            option: true,
            price: true,
          },
        },
        seller: {
          select: {
            userId: true,
            companyName: true,
          },
        },
        shippingMethods: {
          select: {
            id: true,
            name: true,
            price: true,
            estimatedDays: true,
            description: true,
            isActive: true,
          },
        },
      },
    })
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(product)
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
