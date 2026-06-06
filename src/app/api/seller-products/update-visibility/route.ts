import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest) {
  try {
    const { id, isActive } = await req.json()

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid data' },
        { status: 400 }
      )
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
