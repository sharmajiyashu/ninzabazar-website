import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    if (req.method !== 'POST') {
      return NextResponse.json(
        { message: 'Method not allowed' },
        { status: 405 }
      )
    }

    const { sellerId, productId, buyerId, initialMessage } = await req.json()

    const conversation = await prisma.conversation.create({
      data: {
        sellerId,
        productId,
        buyerId,
        messages: { create: { content: initialMessage, senderId: buyerId } },
      },
    })
    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
