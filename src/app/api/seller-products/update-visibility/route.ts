import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { isProductApproved } from '@/lib/product-status'

export async function PUT(req: NextRequest) {
  try {
    const { id, isActive } = await req.json()

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid data' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, status: true, adminApproved: true, isActive: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (isActive && !isProductApproved(product.status, product.adminApproved)) {
      return NextResponse.json(
        {
          error:
            'Only admin-approved products can be listed. Please wait for approval.',
        },
        { status: 400 }
      )
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        isActive,
        // Heal legacy rows where adminApproved was set but status stayed pending
        ...(isActive &&
        isProductApproved(product.status, product.adminApproved)
          ? {
              status: 'approved',
              adminApproved: true,
            }
          : {}),
      },
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
