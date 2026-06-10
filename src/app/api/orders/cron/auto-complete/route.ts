import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ORDER_STATUSES } from '@/lib/order-status'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== process.env.CRON_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const updated = await prisma.order.updateMany({
    where: {
      status: ORDER_STATUSES.DELIVERED,
      deliveryVerifiedAt: {
        lte: oneWeekAgo,
      },
    },
    data: {
      status: ORDER_STATUSES.COMPLETED,
    },
  })

  return NextResponse.json({
    message: 'Auto-complete delivered orders job done',
    count: updated.count,
  })
}
