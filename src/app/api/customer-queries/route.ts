import { NextResponse } from 'next/server'
import { createCustomerQuery } from '@/lib/customer-query'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const source = String(body.source || 'LANDING').toUpperCase()
    const phoneNumber = String(body.phoneNumber || '').replace(/\D/g, '')

    if (phoneNumber.length < 10) {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 })
    }

    if (source === 'PRODUCT') {
      const productId = String(body.productId || '').trim()
      const productName = String(body.productName || '').trim()
      const sellerId = String(body.sellerId || '').trim()
      const quantity = body.quantity != null ? Number(body.quantity) : undefined
      const color = String(body.color || '').trim() || undefined
      const firstName = String(body.firstName || '').trim()

      if (!productId || !productName || !sellerId) {
        return NextResponse.json(
          { error: 'Product and seller information is required' },
          { status: 400 }
        )
      }

      const queryText =
        String(body.query || body.queryText || '').trim() ||
        `Quotation request for ${productName}${quantity ? `, Qty: ${quantity}` : ''}${color ? `, Color: ${color}` : ''}`

      const record = await createCustomerQuery({
        firstName,
        phoneNumber,
        queryText,
        source: 'PRODUCT',
        productId,
        productName,
        sellerId,
        quantity: quantity && quantity > 0 ? Math.floor(quantity) : undefined,
        color,
      })

      return NextResponse.json(
        { message: 'Inquiry submitted successfully', id: record?.id },
        { status: 201 }
      )
    }

    const firstName = String(body.firstName || '').trim()
    const queryText = String(body.query || body.queryText || '').trim()

    if (!firstName || !queryText) {
      return NextResponse.json(
        { error: 'First name and query are required' },
        { status: 400 }
      )
    }

    const record = await createCustomerQuery({ firstName, phoneNumber, queryText, source: 'LANDING' })

    return NextResponse.json(
      { message: 'Query submitted successfully', id: record?.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Customer query submit error:', error)
    return NextResponse.json({ error: 'Failed to submit query' }, { status: 500 })
  }
}
