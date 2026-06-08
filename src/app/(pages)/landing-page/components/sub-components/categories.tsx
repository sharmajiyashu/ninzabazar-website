'use client'

import { Fence, MonitorSmartphone, Shirt, Gem, Volleyball, Baby, Sparkles, Gamepad2, Car, LayoutGrid, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import CategoryArchItem from './category-arch-item'

type CategoryData = {
  id: string
  name: string
  imageUrl?: string | null
  subCategories?: { id: string; name: string; imageUrl?: string | null }[]
}

type CategoriesProps = {
  title?: string
  topCategories?: CategoryData[]
  allCategories?: CategoryData[]
  className?: string
}

const Categories = ({
  title = 'Top Categories',
  topCategories: topCategoriesProp = [],
  allCategories: allCategoriesProp = [],
  className = '',
}: CategoriesProps) => {
  const router = useRouter()
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [activeMegaCat, setActiveMegaCat] = useState<CategoryData | null>(null)

  const topCategories = useMemo(
    () => (topCategoriesProp.length > 0 ? topCategoriesProp : allCategoriesProp),
    [topCategoriesProp, allCategoriesProp]
  )

  const allCategories = useMemo(
    () => (allCategoriesProp.length > 0 ? allCategoriesProp : topCategories),
    [allCategoriesProp, topCategories]
  )

  const sidebarCategories = topCategories
  const megaMenuCategories = showMegaMenu ? allCategories : sidebarCategories

  useEffect(() => {
    if (topCategories.length > 0) {
      setActiveMegaCat(topCategories[0])
    }
  }, [topCategories])

  const getIcon = (name: string, size = 18) => {
    const lower = name.toLowerCase()
    if (lower.includes('home') || lower.includes('garden')) return <Fence size={size} className="text-orange" />
    if (lower.includes('electronic')) return <MonitorSmartphone size={size} className="text-blue-500" />
    if (lower.includes('fashion') || lower.includes('apparel')) return <Shirt size={size} className="text-teal-500" />
    if (lower.includes('accessor')) return <Gem size={size} className="text-purple-500" />
    if (lower.includes('sport')) return <Volleyball size={size} className="text-yellow-500" />
    if (lower.includes('mother') || lower.includes('kid')) return <Baby size={size} className="text-pink-500" />
    if (lower.includes('beauty') || lower.includes('health')) return <Sparkles size={size} className="text-red-400" />
    if (lower.includes('toy') || lower.includes('game')) return <Gamepad2 size={size} className="text-indigo-500" />
    if (lower.includes('auto')) return <Car size={size} className="text-emerald-500" />
    return <LayoutGrid size={size} className="text-gray-500" />
  }

  const CategoryImage = ({ category, size = 'sm' }: { category: CategoryData; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8 rounded-lg',
      md: 'w-12 h-12 rounded-xl',
      lg: 'w-14 h-14 rounded-xl',
    }
    const cls = sizeClasses[size]

    if (category.imageUrl) {
      return (
        <div className={`relative ${cls} overflow-hidden shrink-0 bg-gray-50 border border-gray-100`}>
          <Image src={category.imageUrl} alt={category.name} fill className="object-cover" sizes="56px" />
        </div>
      )
    }

    return (
      <div className={`${cls} flex items-center justify-center shrink-0 bg-green-50 border border-green-100`}>
        {getIcon(category.name, size === 'lg' ? 22 : size === 'md' ? 20 : 16)}
      </div>
    )
  }

  const handleCategoryClick = (category: CategoryData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!showMegaMenu) {
      setShowMegaMenu(true)
    }
    setActiveMegaCat(category)
  }

  const handleSelectCategory = (category: string) => {
    router.push(`/products?category=${encodeURIComponent(category)}`)
    setShowMegaMenu(false)
  }

  const handleSelectSubCategory = (category: string, subCategory: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    router.push(`/products?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(subCategory)}`)
    setShowMegaMenu(false)
  }

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedCat(expandedCat === catId ? null : catId)
  }

  const handleMegaMenuToggle = () => {
    const next = !showMegaMenu
    setShowMegaMenu(next)
    if (next && allCategories.length > 0) {
      setActiveMegaCat(allCategories[0])
    }
  }

  const renderCategoryList = (list: CategoryData[], inMegaMenu: boolean) => (
    <ul className="font-medium flex flex-col gap-y-1 flex-1 overflow-y-auto no-scrollbar pb-2 min-h-0">
      {list.map((category) => {
        const hasSub = category.subCategories && category.subCategories.length > 0
        const isExpanded = expandedCat === category.id
        const isActiveMega = inMegaMenu && activeMegaCat?.id === category.id

        return (
          <li
            key={category.id}
            className="flex flex-col shrink-0"
            onMouseEnter={() => {
              if (inMegaMenu) setActiveMegaCat(category)
            }}
          >
            <div
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                isActiveMega
                  ? 'bg-green-50 border-l-4 border-[#006d44]'
                  : 'hover:bg-green-50 border-l-4 border-transparent group'
              }`}
              onClick={(e) => handleCategoryClick(category, e)}
            >
              <div
                className={`flex items-center gap-2.5 text-sm font-semibold min-w-0 ${
                  isActiveMega ? 'text-[#006d44]' : 'text-gray-600 group-hover:text-[#006d44]'
                }`}
              >
                <CategoryImage category={category} size="sm" />
                <span className="line-clamp-1">{category.name}</span>
              </div>
              {hasSub && !inMegaMenu && (
                <div
                  className="p-1 rounded-md hover:bg-green-100 text-gray-400 hover:text-green-700 transition-colors shrink-0"
                  onClick={(e) => toggleExpand(category.id, e)}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              )}
              {hasSub && inMegaMenu && (
                <div className="text-gray-300 shrink-0">
                  <ChevronRight size={16} />
                </div>
              )}
            </div>

            {hasSub && isExpanded && !inMegaMenu && (
              <ul className="ml-8 mt-1 mb-2 flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
                {category.subCategories!.map((sub) => (
                  <li key={sub.id}>
                    <button
                      type="button"
                      onClick={(e) => handleSelectSubCategory(category.name, sub.name, e)}
                      className="text-left w-full text-xs font-medium text-gray-500 hover:text-[#006d44] py-1.5 transition-colors"
                    >
                      {sub.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className={className}>
      {/* Desktop */}
      <div className="hidden lg:block relative w-full h-full min-h-[480px]">
        <div
          className={`bg-white rounded-2xl transition-all duration-300 h-full ${
            showMegaMenu
              ? 'absolute z-50 top-0 left-0 w-[min(850px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] border border-gray-200 shadow-2xl flex flex-row min-h-[480px]'
              : 'flex flex-col w-full border border-gray-100 shadow-sm p-4'
          }`}
        >
          <div
            className={`flex flex-col min-h-0 ${
              showMegaMenu ? 'w-64 border-r border-gray-100 p-4 shrink-0' : 'w-full h-full'
            }`}
          >
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h2 className="font-bold text-gray-800 text-lg">{title}</h2>
              {showMegaMenu && (
                <button
                  type="button"
                  onClick={() => setShowMegaMenu(false)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="Close categories"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {sidebarCategories.length === 0 ? (
              <div className="text-sm text-gray-500 animate-pulse flex-1">Loading categories...</div>
            ) : showMegaMenu ? (
              renderCategoryList(megaMenuCategories, true)
            ) : (
              renderCategoryList(sidebarCategories, false)
            )}

            <div className="mt-auto border-t border-gray-100 pt-4 shrink-0">
              <button
                type="button"
                onClick={handleMegaMenuToggle}
                className="text-[#006d44] hover:text-green-800 font-bold text-sm underline cursor-pointer"
              >
                {showMegaMenu ? 'Close Categories' : 'View all Categories'}
              </button>
            </div>
          </div>

          {showMegaMenu && (
            <div className="flex-1 p-5 bg-gradient-to-br from-[#f0faf5] to-white rounded-r-2xl overflow-y-auto min-h-0 no-scrollbar">
              {activeMegaCat ? (
                <>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryImage category={activeMegaCat} size="md" />
                      <h3 className="text-xl font-bold text-[#181A20] truncate">{activeMegaCat.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(activeMegaCat.name)}
                      className="shrink-0 text-xs font-bold text-[#006d44] bg-white border border-[#006d44]/30 px-3 py-1.5 rounded-lg hover:bg-green-50"
                    >
                      View all
                    </button>
                  </div>

                  {activeMegaCat.subCategories && activeMegaCat.subCategories.length > 0 ? (
                    <div className="grid grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                      {activeMegaCat.subCategories.map((sub, index) => (
                        <CategoryArchItem
                          key={sub.id}
                          name={sub.name}
                          imageUrl={sub.imageUrl}
                          href={`/products?category=${encodeURIComponent(activeMegaCat.name)}&subCategory=${encodeURIComponent(sub.name)}`}
                          colorIndex={index}
                          size="sm"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CategoryImage category={activeMegaCat} size="lg" />
                      <p className="text-gray-500 text-sm mt-4 mb-4">Browse all products in this category</p>
                      <button
                        type="button"
                        onClick={() => handleSelectCategory(activeMegaCat.name)}
                        className="bg-[#006d44] text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-[#005a36]"
                      >
                        Shop {activeMegaCat.name}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500 text-sm h-full flex items-center justify-center">
                  Select a category to view subcategories
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="block lg:hidden">
        <div className="py-2">
          <h2 className="font-bold mb-3 text-gray-800 text-base">{title}</h2>
          <div className="flex overflow-x-auto gap-3 no-scrollbar pb-1">
            {topCategories.length === 0 ? (
              <div className="text-sm text-gray-500 px-2">Loading...</div>
            ) : (
              topCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectCategory(category.name)}
                  className="flex flex-col items-center shrink-0 w-[72px] cursor-pointer group"
                >
                  <CategoryImage category={category} size="lg" />
                  <span className="text-[10px] font-medium text-gray-700 mt-1.5 text-center line-clamp-2 leading-tight group-hover:text-[#006d44] transition-colors">
                    {category.name}
                  </span>
                </button>
              ))
            )}
          </div>
          {allCategories.length > topCategories.length && (
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="text-[#006d44] font-bold text-xs mt-2 underline"
            >
              View all Categories
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Categories
