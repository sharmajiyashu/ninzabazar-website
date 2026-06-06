import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')
  const userId = req.nextUrl.searchParams.get('userId')

  if (!productId || !userId) {
    return NextResponse.json(
      { error: 'Missing productId or userId' },
      { status: 400 }
    )
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      productId,
      userId,
    },
  })

  return NextResponse.json({ review: existingReview })
}
