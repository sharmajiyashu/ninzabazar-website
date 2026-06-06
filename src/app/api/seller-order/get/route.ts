import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const status = searchParams.get('status') // Optional status filter
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Check if sellerId is provided
    if (!sellerId) {
      return NextResponse.json(
        { message: 'Seller ID is required' },
        { status: 400 }
      )
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line
    const whereClause: any = {
      orderItems: {
        some: {
          product: {
            sellerId: sellerId,
          },
        },
      },
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status
    }

    // Get orders with related data
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          orderItems: {
            where: {
              product: {
                sellerId: sellerId,
              },
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    where: { isDefault: true },
                    take: 1,
                    select: {
                      urlpath: true,
                      alt: true,
                    },
                  },
                },
              },
              variant: {
                select: {
                  id: true,
                  title: true,
                  option: true,
                  price: true,
                },
              },
            },
          },
          buyer: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  contactNumber: true,
                },
              },
            },
          },
          shippingAddress: {
            select: {
              street: true,
              city: true,
              state: true,
              postalCode: true,
              country: true,
            },
          },
          EscrowPayment: {
            select: {
              status: true,
              amount: true,
              releaseDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),

      // Get total count for pagination
      prisma.order.count({
        where: whereClause,
      }),
    ])

    // Calculate seller-specific totals for each order
    const ordersWithSellerTotals = orders.map((order) => {
      const sellerOrderItems = order.orderItems
      const sellerTotal = sellerOrderItems.reduce((sum, item) => {
        return (
          sum +
          Number(item.priceAtPurchase) * item.quantity +
          item.shippingMethodPrice
        )
      }, 0)

      return {
        ...order,
        sellerTotal: sellerTotal,
        sellerItemCount: sellerOrderItems.length,
      }
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json(
      {
        orders: ordersWithSellerTotals,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching seller orders:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
