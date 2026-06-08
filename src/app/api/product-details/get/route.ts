import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { loadProductAttributes } from '@/lib/save-product-attributes'
import { loadProductSpecifications } from '@/lib/save-product-specifications'

export async function GET(req: Request) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
  }
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('id')
  if (!productId) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 })
  }
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } },
        reviews: {
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
            images: {
              select: {
                id: true,
                urlpath: true,
                alt: true,
                reviewId: true,
              },
            },
            createdAt: true,
          },
        },
        orderItems: {
          where: { order: { status: 'COMPLETED' } },
        },
        images: {
          select: {
            id: true,
            urlpath: true,
            alt: true,
            isDefault: true,
          },
        },
        variants: {
          select: {
            id: true,
            title: true,
            option: true,
            price: true,
            hasPrice: true,
          },
        },
        seller: {
          select: {
            id: true,
            userId: true,
            companyName: true,
            shopName: true,
            businessRegisteredName: true,
            businessPhoneNumber: true,
            sellerPhoneNumber: true,
            description: true,
            registeredAddress: {
              select: {
                street: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
              },
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
          },
        },
        shippingMethods: {
          select: {
            id: true,
            name: true,
            price: true,
            estimatedDays: true,
            description: true,
            isActive: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    const [attributes, specifications, gstRows, colorRows, materialRows] =
      await Promise.all([
        loadProductAttributes(productId),
        loadProductSpecifications(productId),
        prisma.$queryRaw<{ gstNumber: string | null }[]>`
          SELECT "gstNumber" FROM "SellerProfile" WHERE id = ${product.sellerId} LIMIT 1
        `,
        prisma.$queryRaw<
          { id: string; name: string; hexCode: string | null }[]
        >`
          SELECT c.id, c.name, c."hexCode"
          FROM "ProductOnColor" poc
          JOIN "ProductColor" c ON c.id = poc."colorId"
          WHERE poc."productId" = ${productId}
        `,
        prisma.$queryRaw<{ id: string; name: string }[]>`
          SELECT m.id, m.name
          FROM "ProductOnMaterial" pom
          JOIN "ProductMaterial" m ON m.id = pom."materialId"
          WHERE pom."productId" = ${productId}
        `,
      ])

    const gstNumber = gstRows[0]?.gstNumber ?? null

    return NextResponse.json({
      ...product,
      ...attributes,
      specifications,
      colors: colorRows,
      materials: materialRows,
      seller: {
        ...product.seller,
        gstNumber,
      },
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
