import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getRazorpayInstance } from '@/lib/razorpay'

const CURRENCY_LIMITS = {
  INR: 500000,
  USD: 10000,
  EUR: 10000,
  GBP: 10000,
  SGD: 10000,
  AUD: 10000,
  CAD: 10000,
} as const

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, currency } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const currencyUpper = currency?.toUpperCase() || 'INR'
    const maxAmount =
      CURRENCY_LIMITS[currencyUpper as keyof typeof CURRENCY_LIMITS]

    if (!maxAmount) {
      return NextResponse.json(
        { error: `Unsupported currency: ${currencyUpper}` },
        { status: 400 }
      )
    }

    if (amount > maxAmount) {
      return NextResponse.json(
        {
          error: `Amount exceeds maximum allowed limit for ${currencyUpper}`,
          maxAllowed: maxAmount,
          receivedAmount: amount,
        },
        { status: 400 }
      )
    }

    const amountInPaise = Math.round(amount * 100)
    const razorpay = getRazorpayInstance()

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currencyUpper,
      receipt: `receipt_${Date.now()}`,
      payment_capture: true,
    })

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
    // eslint-disable-next-line
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)

    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error.error?.description || error.message,
        code: error.error?.code,
      },
      { status: 500 }
    )
  }
}
