'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import B2BProductCard from '@/app/(pages)/products/components/b2b-product-card'

export default function RelatedProducts() {
  const params = useParams()
  const id = params.id

  const { data: currentProduct } = useQuery({
    queryKey: ['currentProduct', id],
    queryFn: async () => {
      const res = await axios.get(`/api/product-details/get?id=${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', currentProduct?.keywords?.join(',')],
    queryFn: async () => {
      if (!currentProduct?.keywords?.length) return []
      const res = await axios.get(
        `/api/related-products?id=${currentProduct.id}&keywords=${currentProduct.keywords.join(',')}`
      )
      return res.data
    },
    enabled: !!currentProduct?.keywords?.length,
  })

  if (!relatedProducts.length) return null

  return (
    <section className="mt-12 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        Other recommendations for your business
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedProducts.slice(0, 4).map((product: Parameters<typeof B2BProductCard>[0]['product']) => (
          <B2BProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
