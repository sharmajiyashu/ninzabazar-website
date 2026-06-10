import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getAuthenticatedSellerProfile,
  sellerOwnsOrder,
} from '@/lib/seller-auth'
import {
  ORDER_STATUSES,
  isValidSellerStatusTransition,
  normalizeOrderStatus,
} from '@/lib/order-status'
import { releaseOrderEscrow } from '@/lib/order-escrow'

export async function PUT(req: NextRequest) {
  try {
    const sellerProfile = await getAuthenticatedSellerProfile()
    if (!sellerProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, status, trackingLink } = await req.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 })
    }

    const targetStatus = normalizeOrderStatus(status)

    const ownsOrder = await sellerOwnsOrder(sellerProfile.id, orderId)
    if (!ownsOrder) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { EscrowPayment: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === ORDER_STATUSES.CANCELLED) {
      return NextResponse.json({ error: 'Order is cancelled' }, { status: 400 })
    }

    if (!isValidSellerStatusTransition(order.status, targetStatus)) {
      return NextResponse.json(
        {
          error: `Cannot change order from ${order.status} to ${targetStatus}`,
        },
        { status: 400 }
      )
    }

    if (targetStatus === ORDER_STATUSES.SHIPPED && !trackingLink?.trim()) {
      return NextResponse.json(
        { error: 'Tracking link is required when marking as shipped' },
        { status: 400 }
      )
    }

    const now = new Date()

    await prisma.$transaction(async (tx) => {
      const updateData: {
        status: string
        trackingLink?: string
        deliveryVerifiedAt?: Date
      } = { status: targetStatus }

      if (targetStatus === ORDER_STATUSES.SHIPPED) {
        updateData.trackingLink = trackingLink.trim()
      }

      if (targetStatus === ORDER_STATUSES.DELIVERED) {
        updateData.deliveryVerifiedAt = now
      }

      await tx.order.update({
        where: { id: orderId },
        data: updateData,
      })

      if (targetStatus === ORDER_STATUSES.DELIVERED) {
        await releaseOrderEscrow(tx, order, now)
      }
    })

    const updated = await prisma.order.findUnique({ where: { id: orderId } })

    return NextResponse.json({ success: true, order: updated })
  } catch (error) {
    console.error('[SELLER_UPDATE_STATUS]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
