import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_data, //eslint-disable-line
    } = await request.json()

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Find the order with order items to get seller information
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
      include: {
        orderItems: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get the seller ID from the first order item
    // For multiple sellers, you would need to create multiple escrow payments
    const sellerId = order.orderItems[0]?.sellerId

    if (!sellerId) {
      return NextResponse.json(
        { success: false, error: 'Seller information not found' },
        { status: 400 }
      )
    }

    // Calculate release date (e.g., 14 days from now)
    const releaseDate = new Date()
    releaseDate.setDate(releaseDate.getDate() + 14)

    // Create escrow payment
    const escrowPayment = await prisma.escrowPayment.create({
      data: {
        id: `escrow_${Date.now()}`,
        orderId: order.id,
        buyerId: order.buyerId,
        sellerId: sellerId,
        amount: order.totalAmount,
        razorpayPaymentId: razorpay_payment_id,
        status: 'HELD',
        releaseDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PROCESSING',
        paymentId: razorpay_payment_id,
      },
    })

    return NextResponse.json({
      success: true,
      escrowPayment,
      releaseDate,
    })
    // eslint-disable-next-line
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
