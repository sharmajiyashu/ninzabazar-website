import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { productId, rating, title, comment } = await req.json()

  if (!productId || !rating || !comment) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Prevent duplicate review by same user for same product
  const existing = await prisma.review.findFirst({
    where: {
      userId: session.user.id,
      productId,
    },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Review already exists' },
      { status: 409 }
    )
  }

  const review = await prisma.review.create({
    data: {
      productId,
      userId: session.user.id,
      rating,
      title,
      comment,
      isVerifiedPurchase: true,
    },
  })

  return NextResponse.json({ success: true, review })
}
