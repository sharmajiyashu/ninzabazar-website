import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { resolveReviewStatus } from '@/lib/product-status'
import { loadProductAttributes } from '@/lib/save-product-attributes'
import { loadProductSpecifications } from '@/lib/save-product-specifications'

const productInclude = {
  images: true,
  category: {
    select: { id: true, name: true },
  },
  subCategory: {
    select: { id: true, name: true },
  },
  variants: true,
  shippingMethods: true,
}

function normalizeProduct<T extends { status: string; adminApproved: boolean }>(
  product: T
) {
  return {
    ...product,
    status: resolveReviewStatus(product.status, product.adminApproved),
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get('sellerId')
    const id = searchParams.get('id')

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: productInclude,
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const attributes = await loadProductAttributes(id)
      const specifications = await loadProductSpecifications(id)
      return NextResponse.json(
        { ...normalizeProduct(product), ...attributes, specifications },
        { status: 200 }
      )
    }

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Missing required parameters: sellerId or id' },
        { status: 400 }
      )
    }

    const products = await prisma.product.findMany({
      where: { sellerId },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products.map(normalizeProduct), { status: 200 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
