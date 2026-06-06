import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Find the order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        EscrowPayment: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify the buyer owns this order
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile || order.buyerId !== buyerProfile.id) {
      return NextResponse.json(
        { error: 'Not authorized to release this payment' },
        { status: 403 }
      )
    }

    // Check if payment exists and is in HELD status
    if (!order.EscrowPayment || order.EscrowPayment.status !== 'HELD') {
      return NextResponse.json(
        {
          error: 'No escrow payment found or payment already released',
        },
        { status: 400 }
      )
    }

    const now = new Date()

    // Release the payment
    await prisma.escrowPayment.update({
      where: { id: order.EscrowPayment.id },
      data: {
        status: 'RELEASED',
        releasedAt: now,
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        isPaymentReleased: true,
      },
    })

    // Update seller wallet balance
    await prisma.sellerWallet.upsert({
      where: { sellerId: order.EscrowPayment.sellerId },
      update: {
        balance: { increment: Number(order.EscrowPayment.amount) },
        availableBalance: { increment: Number(order.EscrowPayment.amount) },
        updatedAt: now,
      },
      create: {
        id: `wallet_${Date.now()}`,
        sellerId: order.EscrowPayment.sellerId,
        balance: Number(order.EscrowPayment.amount),
        availableBalance: Number(order.EscrowPayment.amount),
        pendingBalance: 0,
        createdAt: now,
        updatedAt: now,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment released successfully',
      timestamp: now.toISOString(),
    })
    // eslint-disable-next-line
  } catch (error: any) {
    console.error('Error releasing payment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
