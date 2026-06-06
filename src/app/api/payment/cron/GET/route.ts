import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Secure endpoint with a token
    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    if (token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    console.log('[Cron] Running auto-release job at:', now.toISOString())

    // Find all held escrow payments past their release date
    const paymentsToRelease = await prisma.escrowPayment.findMany({
      where: {
        status: 'HELD',
        releaseDate: {
          lte: now,
        },
      },
    })

    console.log(
      `[Cron] Found ${paymentsToRelease.length} payments to auto-release`
    )

    const releasedPayments: string[] = []

    // Process each payment
    for (const payment of paymentsToRelease) {
      // Update escrow payment status
      await prisma.escrowPayment.update({
        where: { id: payment.id },
        data: {
          status: 'RELEASED',
          releasedAt: now,
        },
      })

      // Update the corresponding order
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'DELIVERED',
          isPaymentReleased: true,
        },
      })

      // Update seller wallet balance
      await prisma.sellerWallet.upsert({
        where: { sellerId: payment.sellerId },
        update: {
          balance: { increment: Number(payment.amount) },
          availableBalance: { increment: Number(payment.amount) },
          updatedAt: now,
        },
        create: {
          id: `wallet_${Date.now()}`,
          sellerId: payment.sellerId,
          balance: Number(payment.amount),
          availableBalance: Number(payment.amount),
          pendingBalance: 0,
          createdAt: now,
          updatedAt: now,
        },
      })

      console.log(`[Cron] Auto-released payment for order ${payment.orderId}`)
      releasedPayments.push(payment.orderId)
    }

    return NextResponse.json({
      success: true,
      releasedOrders: releasedPayments,
      count: releasedPayments.length,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Error processing auto-releases:', error)
    return NextResponse.json(
      { error: 'Failed to process auto-releases' },
      { status: 500 }
    )
  }
}
