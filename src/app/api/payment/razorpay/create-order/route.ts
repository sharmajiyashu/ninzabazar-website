import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const CURRENCY_LIMITS = {
  INR: 500000, // ₹5,00,000
  USD: 10000, // $10,000
  EUR: 10000, // €10,000
  GBP: 10000, // £10,000
  SGD: 10000, // S$10,000
  AUD: 10000, // A$10,000
  CAD: 10000, // C$10,000
} as const

export async function POST(request: NextRequest) {
  try {
    const { amount, currency } = await request.json()

    // Debug logging
    console.log('Received amount:', amount)
    console.log('Amount type:', typeof amount)
    console.log('Currency:', currency)

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const currencyUpper = currency?.toUpperCase() || 'USD'
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

    const amountInCents = Math.round(amount * 100) // Convert to cents

    // More debug logging
    console.log('Amount in cents:', amountInCents)
    console.log('Max amount in cents:', maxAmount * 100)

    const options = {
      amount: amountInCents,
      currency: currency || 'INR', // Default to USD if not provided
      receipt: `receipt#${Date.now()}`,
      payment_capture: 1,
    }

    console.log('Razorpay order options:', options)

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    })
    // eslint-disable-next-line
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)

    // Enhanced error logging
    if (error.error) {
      console.error('Razorpay error details:', {
        code: error.error.code,
        description: error.error.description,
        source: error.error.source,
        step: error.error.step,
        reason: error.error.reason,
        metadata: error.error.metadata,
      })
    }

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
