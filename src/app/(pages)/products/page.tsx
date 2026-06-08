'use client'

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import B2BProductCard from './components/b2b-product-card'
import ProductFilterSidebar from './components/product-filter-sidebar'

const PAGE_SIZE = 12

function normalizeParam(value: string | null) {
  return value?.trim().replace(/\+/g, ' ') || ''
}

function toggleInList(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

const ProductsContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = normalizeParam(searchParams.get('query'))
  const category = normalizeParam(searchParams.get('category'))
  const popular = searchParams.get('popular') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(() => {
    const fromUrl = searchParams.get('subCategories')?.split(',').map((v) => normalizeParam(v)).filter(Boolean) || []
    if (fromUrl.length) return fromUrl
    const single = normalizeParam(searchParams.get('subCategory'))
    return single ? [single] : []
  })
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get('colors')?.split(',').filter(Boolean) || []
  )
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    searchParams.get('materials')?.split(',').filter(Boolean) || []
  )
  const [minOrderInput, setMinOrderInput] = useState(searchParams.get('minOrder') || '')
  const [appliedMinOrder, setAppliedMinOrder] = useState(searchParams.get('minOrder') || '')
  const [subCategorySearch, setSubCategorySearch] = useState('')

  useEffect(() => {
    const fromUrl =
      searchParams.get('subCategories')?.split(',').map((v) => normalizeParam(v)).filter(Boolean) || []
    const single = normalizeParam(searchParams.get('subCategory'))
    setSelectedSubCategories(fromUrl.length ? fromUrl : single ? [single] : [])
    setSelectedColors(searchParams.get('colors')?.split(',').filter(Boolean) || [])
    setSelectedMaterials(searchParams.get('materials')?.split(',').filter(Boolean) || [])
    const minOrder = searchParams.get('minOrder') || ''
    setMinOrderInput(minOrder)
    setAppliedMinOrder(minOrder)
  }, [searchParams])

  const showPopularProducts = popular

  const activeSubCategory = selectedSubCategories.length === 1 ? selectedSubCategories[0] : ''

  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (category) params.set('category', category)
    if (selectedSubCategories.length === 1) {
      params.set('subCategory', selectedSubCategories[0])
    } else if (selectedSubCategories.length > 1) {
      params.set('subCategories', selectedSubCategories.join(','))
    }
    if (selectedColors.length) params.set('colors', selectedColors.join(','))
    if (selectedMaterials.length) params.set('materials', selectedMaterials.join(','))
    if (appliedMinOrder) params.set('minOrder', appliedMinOrder)
    if (page > 1) params.set('page', String(page))
    return params
  }, [query, category, selectedSubCategories, selectedColors, selectedMaterials, appliedMinOrder, page])

  const pushFilters = useCallback(
    (updates: Record<string, string | string[] | number | undefined>) => {
      const params = buildFilterParams()
      Object.entries(updates).forEach(([key, val]) => {
        if (key === 'page' && typeof val === 'number') {
          if (val > 1) params.set('page', String(val))
          else params.delete('page')
          return
        }
        if (Array.isArray(val)) {
          if (val.length) params.set(key, val.join(','))
          else params.delete(key)
        } else if (val) params.set(key, String(val))
        else params.delete(key)
      })
      if (!updates.page) params.delete('page')
      router.push(`/products?${params.toString()}`)
    },
    [buildFilterParams, router]
  )

  const { data: settings } = useQuery({
    queryKey: ['product-settings', category],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      const res = await axios.get(`/api/product-settings?${params.toString()}`)
      return res.data as {
        subCategories: { id: string; name: string; imageUrl?: string | null }[]
        categories: { id: string; name: string; subCategories?: { id: string; name: string; imageUrl?: string | null }[] }[]
        colors: { id: string; name: string; hexCode?: string }[]
        materials: { id: string; name: string }[]
      }
    },
  })

  const filterQuery = buildFilterParams().toString()

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', filterQuery, popular],
    queryFn: async () => {
      if (showPopularProducts) {
        const res = await axios.get('/api/popular-products?limit=40')
        return res.data
      }
      const res = await axios.get(`/api/products?${filterQuery}`)
      return res.data
    },
  })

  const totalProducts = products.length
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return products.slice(start, start + PAGE_SIZE)
  }, [products, currentPage])

  const pageTitle =
    selectedSubCategories.length > 1
      ? `${category} (${selectedSubCategories.join(', ')})`
      : activeSubCategory || category || (query ? `Search: ${query}` : popular ? 'Popular Products' : 'All Products')

  const handleToggleSubCategory = (name: string) => {
    const next = toggleInList(selectedSubCategories, name)
    setSelectedSubCategories(next)
    pushFilters({
      subCategory: next.length === 1 ? next[0] : undefined,
      subCategories: next.length > 1 ? next : undefined,
    })
  }

  const handleClearSubCategories = () => {
    setSelectedSubCategories([])
    pushFilters({ subCategory: undefined, subCategories: undefined })
  }

  const handleSelectCategory = (categoryName: string) => {
    setSelectedSubCategories([])
    setSelectedColors([])
    setSelectedMaterials([])
    setMinOrderInput('')
    setAppliedMinOrder('')
    router.push(`/products?category=${encodeURIComponent(categoryName)}`)
  }

  const handleClearCategory = () => {
    setSelectedSubCategories([])
    setSelectedColors([])
    setSelectedMaterials([])
    setMinOrderInput('')
    setAppliedMinOrder('')
    router.push('/products')
  }

  return (
    <div className="page-container min-h-screen animate-fade-up py-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <ProductFilterSidebar
            category={category}
            subCategory={activeSubCategory}
            subCategories={settings?.subCategories || []}
            allCategories={settings?.categories || []}
            colors={settings?.colors || []}
            materials={settings?.materials || []}
            selectedSubCategories={selectedSubCategories}
            selectedColors={selectedColors}
            selectedMaterials={selectedMaterials}
            minOrder={minOrderInput}
            subCategorySearch={subCategorySearch}
            onSubCategorySearchChange={setSubCategorySearch}
            onToggleSubCategory={handleToggleSubCategory}
            onClearSubCategories={handleClearSubCategories}
            onSelectCategory={handleSelectCategory}
            onClearCategory={handleClearCategory}
            onToggleColor={(id) => {
              const next = toggleInList(selectedColors, id)
              setSelectedColors(next)
              pushFilters({ colors: next })
            }}
            onToggleMaterial={(id) => {
              const next = toggleInList(selectedMaterials, id)
              setSelectedMaterials(next)
              pushFilters({ materials: next })
            }}
            onMinOrderChange={setMinOrderInput}
            onApplyMinOrder={() => {
              setAppliedMinOrder(minOrderInput)
              pushFilters({ minOrder: minOrderInput })
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <nav className="text-sm text-gray-500 mb-2 hidden md:block">
              {category ? (
                <>
                  <span className="font-semibold text-gray-800">{category}</span>
                  {(activeSubCategory || selectedSubCategories.length > 0) && (
                    <>
                      {' '}&gt;{' '}
                      <span className="text-[#006d44] font-semibold">
                        {selectedSubCategories.length > 1
                          ? selectedSubCategories.join(', ')
                          : activeSubCategory || selectedSubCategories[0]}
                      </span>
                    </>
                  )}
                  <span className="block text-gray-400 mt-0.5">Ninja Bazaar</span>
                </>
              ) : (
                <span>Ninja Bazaar</span>
              )}
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-[#006d44]">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">
              (Showing {(currentPage - 1) * PAGE_SIZE + 1} – {Math.min(currentPage * PAGE_SIZE, totalProducts)} products of {totalProducts} products)
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#006d44] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pagedProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No products found for your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {pagedProducts.map((product: B2BListingProduct) => (
                <B2BProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => pushFilters({ page: currentPage - 1 })}
                className="px-3 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const params = buildFilterParams()
                    params.set('page', String(p))
                    router.push(`/products?${params.toString()}`)
                  }}
                  className={`w-9 h-9 rounded text-sm font-semibold ${
                    p === currentPage ? 'bg-[#006d44] text-white' : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              {totalPages > 5 && <span className="text-gray-400">…</span>}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => pushFilters({ page: currentPage + 1 })}
                className="px-3 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type B2BListingProduct = {
  id: string
  name: string
  basePrice: number | string
  salePrice?: number | string | null
  isSale?: boolean
  minOrderQuantity?: number | null
  images?: { urlpath: string; isDefault?: boolean }[]
  variants?: { price: number | string; hasPrice?: boolean }[]
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-[#006d44] border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductsContent />
    </Suspense>
  )
}
