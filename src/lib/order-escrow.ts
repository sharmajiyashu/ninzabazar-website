import { Prisma } from '@prisma/client'

type OrderWithEscrow = {
  id: string
  isPaymentReleased: boolean
  EscrowPayment: {
    id: string
    status: string
    amount: Prisma.Decimal | number
    sellerId: string
  } | null
}

export async function releaseOrderEscrow(
  tx: Prisma.TransactionClient,
  order: OrderWithEscrow,
  now: Date
) {
  const escrow = order.EscrowPayment
  if (!escrow || escrow.status !== 'HELD' || order.isPaymentReleased) {
    return
  }

  await tx.escrowPayment.update({
    where: { id: escrow.id },
    data: { status: 'RELEASED', releasedAt: now },
  })

  await tx.order.update({
    where: { id: order.id },
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
