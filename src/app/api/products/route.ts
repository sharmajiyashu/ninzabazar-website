import {
  fetchFilteredProducts,
  fetchProductsID,
  fetchSearchProducts,
  fetchSellerProducts,
} from '@/app/services/products.service'
import { NextResponse } from 'next/server'

function parseListParam(value: string | null) {
  if (!value) return []
  return value.split(',').map((v) => v.trim().replace(/\+/g, ' ')).filter(Boolean)
}

function normalizeParam(value: string | null) {
  return value?.trim().replace(/\+/g, ' ') || undefined
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    const query = normalizeParam(searchParams.get('query'))
    const id = searchParams.get('id')
    const category = normalizeParam(searchParams.get('category'))
    const subCategory = normalizeParam(searchParams.get('subCategory'))
    const subCategoryNames = parseListParam(searchParams.get('subCategories'))
    const sellerId = searchParams.get('sellerId')

    const filters = {
      subCategoryNames: subCategoryNames.length ? subCategoryNames : undefined,
      colorIds: parseListParam(searchParams.get('colors')),
      materialIds: parseListParam(searchParams.get('materials')),
      minOrder: (() => {
        const raw = searchParams.get('minOrder')
        if (!raw) return null
        const n = parseInt(raw, 10)
        return Number.isNaN(n) ? null : n
      })(),
    }

    if (q) {
      return NextResponse.json(await fetchSearchProducts(q))
    }

    if (id) {
      return NextResponse.json(await fetchProductsID(id))
    }

    if (sellerId) {
      return NextResponse.json(await fetchSellerProducts(sellerId))
    }

    const products = await fetchFilteredProducts({
      query,
      category,
      subCategory,
      ...filters,
    })
    return NextResponse.json(products)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
