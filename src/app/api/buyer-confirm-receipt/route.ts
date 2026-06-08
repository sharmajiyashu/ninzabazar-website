import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { ORDER_STATUSES } from '@/lib/order-status'

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { EscrowPayment: true },
    })

    if (!order || order.buyerId !== buyerProfile.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === ORDER_STATUSES.CANCELLED) {
      return NextResponse.json({ error: 'Order is cancelled' }, { status: 400 })
    }

    const now = new Date()

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: ORDER_STATUSES.DELIVERED,
          deliveryVerifiedAt: now,
        },
      })

      const escrow = order.EscrowPayment
      if (escrow && escrow.status === 'HELD' && !order.isPaymentReleased) {
        await tx.escrowPayment.update({
          where: { id: escrow.id },
          data: { status: 'RELEASED', releasedAt: now },
        })

        await tx.order.update({
          where: { id: orderId },
          data: { isPaymentReleased: true },
        })

        await tx.sellerWallet.upsert({
          where: { sellerId: escrow.sellerId },
          update: {
            balance: { increment: Number(escrow.amount) },
            availableBalance: { increment: Number(escrow.amount) },
            updatedAt: now,
          },
          create: {
            id: `wallet_${Date.now()}`,
            sellerId: escrow.sellerId,
            balance: Number(escrow.amount),
            availableBalance: Number(escrow.amount),
            pendingBalance: 0,
            createdAt: now,
            updatedAt: now,
          },
        })
      }
    })

    return NextResponse.json({ message: 'Order marked as delivered' })
  } catch (error) {
    console.error('Error confirming receipt:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
