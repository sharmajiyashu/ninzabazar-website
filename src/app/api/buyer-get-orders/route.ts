import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const buyerId = req.nextUrl.searchParams.get('buyerId')
  if (!buyerId) {
    return NextResponse.json({ error: 'Missing buyerId' }, { status: 400 })
  }

  try {
    const orders = await prisma.order.findMany({
      where: { buyerId },
      include: {
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedOrders = orders.flatMap((order) =>
      order.orderItems.map((item) => ({
        orderItemId: item.id,
        orderId: order.id,
        orderTitle: item.product.name,
        orderDetails: `Ordered on ${new Date(order.createdAt).toLocaleDateString()}`,
        orderQty: item.quantity,
        orderPrice: parseFloat(item.priceAtPurchase.toString()),
        orderImg: item.product.images[0]?.urlpath || '/placeholder.png',
        statusType: order.status,
        storeId: item.product.seller.id,
        productId: item.product.id,
      }))
    )

    const uniqueStores = [
      ...new Map(
        formattedOrders.map((o) => [
          o.storeId,
          {
            storeId: o.storeId,
            storeName:
              orders
                .find((order) =>
                  order.orderItems.some(
                    (i) => i.product.seller.id === o.storeId
                  )
                )
                ?.orderItems.find((i) => i.product.seller.id === o.storeId)
                ?.product.seller.shopName || 'Unknown',
          },
        ])
      ).values(),
    ]

    const orderStatus = [
      { statusType: 'processing', label: 'Processing' },
      { statusType: 'shipped', label: 'Shipped' },
      { statusType: 'delivered', label: 'Delivered' },
      { statusType: 'completed', label: 'Completed' },
      { statusType: 'cancelled', label: 'Cancelled' },
      { statusType: 'returned', label: 'Returned' },
    ]

    return NextResponse.json({
      store: uniqueStores,
      order: formattedOrders,
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
