import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const reviewId = (await params).id
  const { rating, title, comment } = await req.json()

  const existing = await prisma.review.findUnique({
    where: { id: reviewId },
  })

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating,
      title,
      comment,
    },
  })

  return NextResponse.json({ success: true, review: updated })
}
