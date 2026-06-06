import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        SellerWallet: true,
      },
    })

    if (!sellerProfile) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      )
    }

    // Create wallet if it doesn't exist
    let wallet = sellerProfile.SellerWallet
    if (!wallet) {
      wallet = await prisma.sellerWallet.create({
        data: {
          id: `wallet_${Date.now()}`,
          sellerId: sellerProfile.id,
          balance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }

    // Calculate current balances based on escrow payments
    const releasedPayments = await prisma.escrowPayment.findMany({
      where: {
        sellerId: sellerProfile.id,
        status: 'RELEASED',
      },
    })

    const heldPayments = await prisma.escrowPayment.findMany({
      where: {
        sellerId: sellerProfile.id,
        status: 'HELD',
      },
    })

    // Calculate totals
    const availableTotal = releasedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    )

    const pendingTotal = heldPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    )

    // Return wallet info with calculated balances
    return NextResponse.json({
      wallet: {
        id: wallet.id,
        availableBalance: availableTotal,
        pendingBalance: pendingTotal,
        recentTransactions: [...releasedPayments, ...heldPayments]
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 10), // Get 10 most recent transactions
      },
    })
    // eslint-disable-next-line
  } catch (error: any) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
