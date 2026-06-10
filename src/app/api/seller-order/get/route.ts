import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getAuthenticatedSellerProfile } from '@/lib/seller-auth'
import { normalizeOrderStatus } from '@/lib/order-status'

export async function GET(request: Request) {
  try {
    const sellerProfile = await getAuthenticatedSellerProfile()
    if (!sellerProfile) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sellerId = sellerProfile.id
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      orderItems: {
        some: {
          OR: [{ sellerId }, { product: { sellerId } }],
        },
      },
    }

    if (status && status !== 'all') {
      whereClause.status = normalizeOrderStatus(status)
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          orderItems: {
            where: {
              OR: [{ sellerId }, { product: { sellerId } }],
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
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: whereClause,
      }),
    ])

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
        sellerTotal,
        sellerItemCount: sellerOrderItems.length,
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json(
      {
        orders: ordersWithSellerTotals,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
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
