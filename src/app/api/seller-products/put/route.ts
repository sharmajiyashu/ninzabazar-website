import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
  try {
    const {
      id,
      name,
      description,
      basePrice,
      isSale,
      salePrice,
      categoryId,
      subCategoryId,
    } = await req.json()

    const parsedBasePrice = Number(basePrice)
    const parsedSalePrice = salePrice != null ? Number(salePrice) : null

    if (isSale) {
      if (!parsedSalePrice || parsedSalePrice <= 0) {
        return NextResponse.json(
          { error: 'Sale price must be greater than 0 when product is on sale' },
          { status: 400 }
        )
      }
      if (parsedSalePrice >= parsedBasePrice) {
        return NextResponse.json(
          { error: 'Sale price must be less than base price' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        basePrice: parsedBasePrice,
        isSale: Boolean(isSale),
        salePrice: isSale ? parsedSalePrice : null,
        ...(categoryId && {
          category: { connect: { id: categoryId } },
          ...(subCategoryId && subCategoryId !== 'none'
            ? { subCategory: { connect: { id: subCategoryId } } }
            : { subCategory: { disconnect: true } }),
        }),
      },
      include: {
        category: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } },
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
