import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { ORDER_STATUSES } from '@/lib/order-status'

export async function GET(req: NextRequest) {
  const buyerId = req.nextUrl.searchParams.get('buyerId')
  if (!buyerId) {
    return NextResponse.json({ error: 'Missing buyerId' }, { status: 400 })
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile || buyerProfile.id !== buyerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      where: { buyerId },
      include: {
        shippingAddress: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  where: { isDefault: true },
                  select: { urlpath: true },
                  take: 1,
                },
                seller: {
                  select: {
                    id: true,
                    shopName: true,
                  },
                },
              },
            },
            variant: {
              select: {
                title: true,
                option: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const groupedOrders = orders.map((order) => {
      const firstItem = order.orderItems[0]
      const store = firstItem?.product.seller

      return {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        trackingLink: order.trackingLink || '',
        totalAmount: Number(order.totalAmount),
        itemCount: order.orderItems.reduce((sum, i) => sum + i.quantity, 0),
        store: {
          id: store?.id || '',
          name: store?.shopName || 'Unknown Store',
        },
        shippingAddress: order.shippingAddress
          ? {
              street: order.shippingAddress.street,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              postalCode: order.shippingAddress.postalCode,
              country: order.shippingAddress.country,
            }
          : null,
        items: order.orderItems.map((item) => ({
          id: item.id,
          productId: item.product.id,
          name: item.productName || item.product.name,
          quantity: item.quantity,
          price: Number(item.priceAtPurchase),
          image: item.product.images[0]?.urlpath || '/placeholder.png',
          variantTitle: item.variant?.title,
          variantOption: item.variant?.option,
        })),
      }
    })

    const orderStatus = [
      { statusType: ORDER_STATUSES.PROCESSING, label: 'Preparing Order' },
      { statusType: ORDER_STATUSES.SHIPPED, label: 'On the Way' },
      { statusType: ORDER_STATUSES.DELIVERED, label: 'Delivered' },
      { statusType: ORDER_STATUSES.COMPLETED, label: 'Completed' },
      { statusType: ORDER_STATUSES.CANCELLED, label: 'Cancelled' },
    ]

    return NextResponse.json({
      orders: groupedOrders,
      orderCount: groupedOrders.length,
      orderStatus,
    })
  } catch (error) {
    console.error('Error getting buyer orders:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
