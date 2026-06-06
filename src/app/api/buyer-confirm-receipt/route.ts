// app/api/confirm-receipt/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const { orderId } = await req.json()

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'delivered' },
    })

    return NextResponse.json({ message: 'Order marked as delivered' })
  } catch (error) {
    console.error('Error confirming receipt:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
