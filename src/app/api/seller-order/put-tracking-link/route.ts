import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { normalizeOrderStatus } from '@/lib/order-status'

export async function PUT(req: NextRequest) {
  try {
    const { orderId, status, trackingLink } = await req.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: normalizeOrderStatus(status),
        trackingLink: trackingLink || '',
      },
    })

    return NextResponse.json({ success: true, order: updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
