import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getAuthenticatedSellerProfile } from '@/lib/seller-auth'
import { ORDER_STATUSES } from '@/lib/order-status'

export async function GET() {
  try {
    const sellerProfile = await getAuthenticatedSellerProfile()
    if (!sellerProfile) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const sellerId = sellerProfile.id
    const sellerOrderFilter = {
      orderItems: {
        some: {
          OR: [{ sellerId }, { product: { sellerId } }],
        },
      },
    }

    const [total, processing, shipped, completed, cancelled, recentOrders] =
      await Promise.all([
        prisma.order.count({ where: sellerOrderFilter }),
        prisma.order.count({
          where: {
            ...sellerOrderFilter,
            status: ORDER_STATUSES.PROCESSING,
          },
        }),
        prisma.order.count({
          where: {
            ...sellerOrderFilter,
            status: ORDER_STATUSES.SHIPPED,
          },
        }),
        prisma.order.count({
          where: {
            ...sellerOrderFilter,
            status: ORDER_STATUSES.COMPLETED,
          },
        }),
        prisma.order.count({
          where: {
            ...sellerOrderFilter,
            status: ORDER_STATUSES.CANCELLED,
          },
        }),
        prisma.order.findMany({
          where: sellerOrderFilter,
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            orderItems: {
              where: {
                OR: [{ sellerId }, { product: { sellerId } }],
              },
              include: {
                product: {
                  select: { id: true, name: true },
                },
              },
            },
            buyer: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        }),
      ])

    return NextResponse.json({
      stats: {
        total,
        processing,
        shipped,
        completed,
        cancelled,
      },
      recentOrders,
    })
  } catch (error) {
    console.error('Error fetching seller order stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
