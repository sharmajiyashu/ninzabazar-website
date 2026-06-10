import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getAuthenticatedSellerProfile,
  sellerOwnsOrder,
} from '@/lib/seller-auth'
import { ORDER_STATUSES } from '@/lib/order-status'

export async function PUT(req: NextRequest) {
  try {
    const sellerProfile = await getAuthenticatedSellerProfile()
    if (!sellerProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, reason } = await req.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const ownsOrder = await sellerOwnsOrder(sellerProfile.id, orderId)
    if (!ownsOrder) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== ORDER_STATUSES.PROCESSING) {
      return NextResponse.json(
        { error: 'Only processing orders can be cancelled' },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: ORDER_STATUSES.CANCELLED,
        cancellationReason: reason || null,
      },
    })

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('[ORDER_CANCEL_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
