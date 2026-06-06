import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const keywords = searchParams.get('keywords')
    if (!id && !keywords) {
      return NextResponse.json(
        { message: 'Missing required parameters: id or keywords ' },
        { status: 400 }
      )
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        status: 'approved',
        isActive: true,
        AND: [
          {
            id: {
              not: id || undefined,
            },
          },
          {
            isActive: true,
          },
        ],
        ...(keywords
          ? {
              OR: keywords.split(',').flatMap((keyword: string) => [
                {
                  keywords: { has: keyword },
                },
                {
                  name: {
                    contains: keyword,
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains: keyword,
                    mode: 'insensitive',
                  },
                },
              ]),
            }
          : {}),
      },
      include: {
        images: {
          select: {
            id: true,
            urlpath: true,
            alt: true,
          },
        },
      },
      take: 3,
    })
    return NextResponse.json(relatedProducts)
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
