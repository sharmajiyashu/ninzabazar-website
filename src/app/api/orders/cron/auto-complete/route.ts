import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== process.env.CRON_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const updated = await prisma.order.updateMany({
    where: {
      status: 'delivered',
      deliveryVerifiedAt: {
        lte: oneWeekAgo,
      },
    },
    data: {
      status: 'completed',
    },
  })

  return NextResponse.json({
    message: 'Auto-complete delivered orders job done',
    count: updated.count,
  })
}
