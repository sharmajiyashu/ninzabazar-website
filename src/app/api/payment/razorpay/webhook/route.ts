import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const body = await request.text()

    if (!verifyRazorpayWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(body)
    const event = payload.event

    if (event === 'payment.captured') {
      const payment = payload.payload?.payment?.entity
      if (!payment) {
        return NextResponse.json({ received: true })
      }

      const razorpayOrderId = payment.order_id
      const razorpayPaymentId = payment.id

      const existingOrder = await prisma.order.findFirst({
        where: { razorpayOrderId },
      })

      if (existingOrder) {
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: { paymentId: razorpayPaymentId },
        })

        await prisma.escrowPayment.updateMany({
          where: { orderId: existingOrder.id },
          data: { razorpayPaymentId },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
