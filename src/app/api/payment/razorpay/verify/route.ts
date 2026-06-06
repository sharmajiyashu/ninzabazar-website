import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required payment verification data',
          missing: {
            order_id: !razorpay_order_id,
            payment_id: !razorpay_payment_id,
            signature: !razorpay_signature,
          },
        },
        { status: 400 }
      )
    }

    // Check if secret key exists
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      console.error('RAZORPAY_SECRET_KEY is not set in environment variables')
      return NextResponse.json(
        { success: false, message: 'Payment configuration error' },
        { status: 500 }
      )
    }

    // Create the signature verification string
    const signatureVerificationString = `${razorpay_order_id}|${razorpay_payment_id}`

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureVerificationString)
      .digest('hex')

    console.log('Payment verification details:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      received_signature: razorpay_signature,
      expected_signature: expectedSignature,
      verification_string: signatureVerificationString,
    })

    // Use crypto.timingSafeEqual for secure comparison
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    )

    if (!isSignatureValid) {
      console.error('Payment signature verification failed', {
        expected: expectedSignature,
        received: razorpay_signature,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      })

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid payment signature',
          debug:
            process.env.NODE_ENV === 'development'
              ? {
                  expected: expectedSignature,
                  received: razorpay_signature,
                }
              : undefined,
        },
        { status: 400 }
      )
    }

    // Payment is verified successfully
    console.log('Payment verified successfully:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified successfully',
        data: {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
        },
      },
      { status: 200 }
    )
    // eslint-disable-next-line
  } catch (error: any) {
    console.error('Payment verification error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Payment verification failed',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
