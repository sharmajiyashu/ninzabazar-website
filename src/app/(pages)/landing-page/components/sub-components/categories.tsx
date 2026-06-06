'use client'
import { Fence, MonitorSmartphone, Shirt, Gem, Volleyball, Baby, Sparkles, Gamepad2, Car, LayoutGrid, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

const Categories = () => {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [expandedCat, setExpandedCat] = useState<string | null>(null)

  // Mega Menu State
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [activeMegaCat, setActiveMegaCat] = useState<any>(null)

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (Array.isArray(data)) {
          setCategories(data)
          if (data.length > 0) setActiveMegaCat(data[0]) // Default active
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    fetchCats()
  }, [])

  const getIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('home') || lower.includes('garden')) return <Fence size={18} className="text-orange" />
    if (lower.includes('electronic')) return <MonitorSmartphone size={18} className="text-blue-500" />
    if (lower.includes('fashion') || lower.includes('apparel')) return <Shirt size={18} className="text-teal-500" />
    if (lower.includes('accessor')) return <Gem size={18} className="text-purple-500" />
    if (lower.includes('sport')) return <Volleyball size={18} className="text-yellow-500" />
    if (lower.includes('mother') || lower.includes('kid')) return <Baby size={18} className="text-pink-500" />
    if (lower.includes('beauty') || lower.includes('health')) return <Sparkles size={18} className="text-red-400" />
    if (lower.includes('toy') || lower.includes('game')) return <Gamepad2 size={18} className="text-indigo-500" />
    if (lower.includes('auto')) return <Car size={18} className="text-emerald-500" />
    return <LayoutGrid size={18} className="text-gray-500" />
  }

  const handleCategoryClick = (category: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!showMegaMenu) {
      setShowMegaMenu(true)
    }
    setActiveMegaCat(category)
  }

  const handleSelectCategory = (category: string) => {
    router.push(`/products?category=${category}`)
    setShowMegaMenu(false)
  }

  const handleSelectSubCategory = (category: string, subCategory: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    router.push(`/products?category=${category}&subCategory=${subCategory}`)
    setShowMegaMenu(false)
  }

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (expandedCat === catId) {
      setExpandedCat(null)
    } else {
      setExpandedCat(catId)
    }
  }

  const handleMegaMenuToggle = () => {
    setShowMegaMenu(!showMegaMenu)
    if (!showMegaMenu && categories.length > 0 && !activeMegaCat) {
      setActiveMegaCat(categories[0])
    }
  }

  return (
    <div>
      {/* Desktop View */}
      <div className="hidden lg:block relative w-full md:w-64 h-[550px]">
        {/* We fix the height or just let it occupy space. Let's make it relative so it holds space. */}
        <div
          className={`bg-white rounded-2xl transition-all duration-300 ${showMegaMenu
            ? 'absolute z-50 top-0 left-0 w-[850px] border border-gray-200 shadow-2xl flex min-h-[500px]'
            : 'w-full md:w-64 border border-gray-100 shadow-sm p-6'
            }`}
        >
          {/* Left Panel (Categories List) */}
          <div className={`${showMegaMenu ? 'w-64 border-r border-gray-100 p-6 flex flex-col shrink-0' : 'w-full h-full flex flex-col'}`}>
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-bold text-gray-800 text-lg">Top Categories</h1>
              {showMegaMenu && (
                <button onClick={() => setShowMegaMenu(false)} className="text-gray-400 hover:text-red-500">
                  <X size={20} />
                </button>
              )}
            </div>

            {categories.length === 0 ? (
              <div className="text-sm text-gray-500 animate-pulse flex-1">Loading categories...</div>
            ) : (
              <ul className="font-medium flex flex-col gap-y-1 flex-1 overflow-y-auto no-scrollbar pb-4">
                {categories.map((category) => {
                  const hasSub = category.subCategories && category.subCategories.length > 0;
                  const isExpanded = expandedCat === category.id;
                  const isActiveMega = showMegaMenu && activeMegaCat?.id === category.id;

                  return (
                    <li
                      key={category.id}
                      className="flex flex-col"
                      onMouseEnter={() => {
                        if (showMegaMenu) setActiveMegaCat(category)
                      }}
                    >
                      <div
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isActiveMega
                          ? 'bg-green-50 border-l-4 border-[#006d44]'
                          : 'hover:bg-green-50 border-l-4 border-transparent group'
                          }`}
                        onClick={(e) => handleCategoryClick(category, e)}
                      >
                        <div className={`flex items-center gap-3 text-sm font-semibold ${isActiveMega ? 'text-[#006d44]' : 'text-gray-600 group-hover:text-[#006d44]'
                          }`}>
                          {getIcon(category.name)} {category.name}
                        </div>
                        {hasSub && !showMegaMenu && (
                          <div
                            className="p-1 rounded-md hover:bg-green-100 text-gray-400 hover:text-green-700 transition-colors"
                            onClick={(e) => toggleExpand(category.id, e)}
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                        )}
                        {hasSub && showMegaMenu && (
                          <div className="text-gray-300">
                            <ChevronRight size={16} />
                          </div>
                        )}
                      </div>

                      {/* Normal Dropdown (only visible when Mega Menu is closed) */}
                      {hasSub && isExpanded && !showMegaMenu && (
                        <ul className="ml-8 mt-1 mb-2 flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
                          {category.subCategories.map((sub: any) => (
                            <li key={sub.id}>
                              <button
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
                  );
                })}
              </ul>
            )}

            <div className="mt-auto border-t border-gray-100 pt-4 shrink-0">
              <button
                onClick={handleMegaMenuToggle}
                className="text-[#006d44] hover:text-green-800 font-bold text-sm underline cursor-pointer"
              >
                {showMegaMenu ? 'Close Categories' : 'View all Categories'}
              </button>
            </div>
          </div>

          {/* Right Panel (Mega Menu Content) */}
          {showMegaMenu && (
            <div className="flex-1 p-8 bg-white rounded-r-2xl overflow-y-auto max-h-[600px] no-scrollbar">
              {activeMegaCat ? (
                <>
                  <h2 className="text-2xl font-bold text-[#181A20] mb-8">{activeMegaCat.name}</h2>

                  {activeMegaCat.subCategories && activeMegaCat.subCategories.length > 0 ? (
                    <div className="grid grid-cols-4 gap-x-6 gap-y-10">
                      {activeMegaCat.subCategories.map((sub: any) => (
                        <div
                          key={sub.id}
                          className="flex flex-col items-center cursor-pointer group"
                          onClick={() => handleSelectSubCategory(activeMegaCat.name, sub.name)}
                        >
                          {/* Arch Container */}
                          <div className="relative w-20 h-16 md:w-24 md:h-20">
                            <div className="absolute inset-0 bg-[#a7ebd1] rounded-t-[80px] shadow-sm transition-colors duration-300 group-hover:bg-[#8ee1c2]"></div>

                            {/* Floating Image */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 md:w-20 md:h-24 flex items-end justify-center pb-1">
                              {sub.imageUrl ? (
                                <div className="relative w-full h-full">
                                  <Image
                                    src={sub.imageUrl}
                                    alt={sub.name}
                                    fill
                                    className="object-contain object-bottom transition-transform duration-300 group-hover:-translate-y-1 drop-shadow-sm"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-gray-400 font-bold text-sm shadow mb-2 group-hover:-translate-y-1 transition-transform">
                                  {sub.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-700 text-xs mt-3 group-hover:text-[#006d44] transition-colors text-center px-1 leading-tight">
                            {sub.name}
                          </h3>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm mt-10 text-center w-full">
                      No subcategories available.
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500 text-sm h-full flex items-center justify-center">
                  Select a category to view items
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden">
        <div className="py-4 px-3">
          <h1 className="font-bold mb-4 text-gray-800 text-lg">Top Categories</h1>
          <div className="flex overflow-x-auto space-x-4 no-scrollbar">
            {categories.length === 0 ? (
              <div className="text-sm text-gray-500 px-2">Loading...</div>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category.name)}
                  className="flex items-center gap-2 whitespace-nowrap py-2.5 px-5 text-sm bg-gray-50 border border-gray-200 rounded-full text-gray-700 cursor-pointer transition-colors hover:bg-gray-100 font-medium"
                >
                  {getIcon(category.name)} <span>{category.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories
