import {
  fetchCategoryProducts,
  fetchProductsID,
  fetchQueryProducts,
  fetchSearchProducts,
  fetchSellerProducts,
} from '@/app/services/products.service'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') // for search
    const query = searchParams.get('query') // for product list
    const id = searchParams.get('id')
    const category = searchParams.get('category')
    const subCategory = searchParams.get('subCategory')
    const sellerId = searchParams.get('sellerId')

    if (q) {
      const searchProduct = await fetchSearchProducts(q)
      return NextResponse.json(searchProduct)
    }

    if (id) {
      const ByProductID = await fetchProductsID(id)
      return NextResponse.json(ByProductID)
    }

    if (query) {
      const QueryProductList = await fetchQueryProducts(query)
      return NextResponse.json(QueryProductList)
    }

    if (category) {
      const ProductsByCategory = await fetchCategoryProducts(category, subCategory)
      return NextResponse.json(ProductsByCategory)
    }

    if (sellerId) {
      const SellerProducts = await fetchSellerProducts(sellerId)
      return NextResponse.json(SellerProducts)
    }

    return NextResponse.json(
      { message: 'Missing required parameters: query or id' },
      { status: 400 }
    )
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
