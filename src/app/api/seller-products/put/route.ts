import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
  try {
    const { id, name, description, basePrice, isSale, salePrice } =
      await req.json()

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        basePrice,
        isSale,
        salePrice: isSale ? salePrice : null,
      },
    })
    return NextResponse.json(
      {
        message: 'Product updated successfully',
        product,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
