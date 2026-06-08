'use client'

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

type FilterOption = { id: string; name: string; hexCode?: string | null; imageUrl?: string | null }

type ProductFilterSidebarProps = {
  category?: string
  subCategory?: string
  subCategories: FilterOption[]
  allCategories: { id: string; name: string; subCategories?: FilterOption[] }[]
  colors: FilterOption[]
  materials: FilterOption[]
  selectedSubCategories: string[]
  selectedColors: string[]
  selectedMaterials: string[]
  minOrder: string
  subCategorySearch: string
  onSubCategorySearchChange: (v: string) => void
  onToggleSubCategory: (name: string) => void
  onClearSubCategories: () => void
  onSelectCategory: (name: string) => void
  onClearCategory: () => void
  onToggleColor: (id: string) => void
  onToggleMaterial: (id: string) => void
  onMinOrderChange: (v: string) => void
  onApplyMinOrder: () => void
}

const VISIBLE_LIMIT = 6

export default function ProductFilterSidebar({
  category,
  subCategory,
  subCategories,
  allCategories,
  colors,
  materials,
  selectedSubCategories,
  selectedColors,
  selectedMaterials,
  minOrder,
  subCategorySearch,
  onSubCategorySearchChange,
  onToggleSubCategory,
  onClearSubCategories,
  onSelectCategory,
  onClearCategory,
  onToggleColor,
  onToggleMaterial,
  onMinOrderChange,
  onApplyMinOrder,
}: ProductFilterSidebarProps) {
  const filteredSubs = subCategories.filter((s) =>
    s.name.toLowerCase().includes(subCategorySearch.toLowerCase())
  )
  const visibleSubs = filteredSubs.slice(0, VISIBLE_LIMIT)
  const visibleColors = colors.slice(0, VISIBLE_LIMIT)
  const visibleMaterials = materials.slice(0, VISIBLE_LIMIT)

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Category upper, Ninja Bazaar below */}
      <div className="border-b border-gray-100 pb-4">
        {category ? (
          <>
            <p className="text-lg font-bold text-[#006d44] leading-tight">{category}</p>
            {(subCategory || selectedSubCategories.length > 0) && (
              <p className="text-sm text-gray-600 mt-1 flex items-center flex-wrap gap-1">
                <ChevronRight size={12} className="text-gray-400 shrink-0" />
                <span className="font-semibold text-gray-800">
                  {selectedSubCategories.length > 1
                    ? selectedSubCategories.join(', ')
                    : subCategory || selectedSubCategories[0]}
                </span>
              </p>
            )}
          </>
        ) : (
          <p className="text-lg font-bold text-gray-900">All Products</p>
        )}
        <button
          type="button"
          onClick={onClearCategory}
          className="text-sm text-gray-500 hover:text-[#006d44] mt-2 block"
        >
          Ninja Bazaar
        </button>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
        <div className="space-y-1 max-h-52 overflow-y-auto">
          {allCategories.map((cat) => {
            const isActive = category?.toLowerCase() === cat.name.toLowerCase()
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`block w-full text-left text-sm py-2 px-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-50 text-[#006d44] font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#006d44]'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      {category && subCategories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Subcategories</h3>
            {selectedSubCategories.length > 0 && (
              <button
                type="button"
                onClick={onClearSubCategories}
                className="text-xs text-[#006d44] font-semibold hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Search subcategory"
            value={subCategorySearch}
            onChange={(e) => onSubCategorySearchChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-[#006d44]"
          />
          <div className="space-y-2">
            {visibleSubs.map((sub) => (
              <label
                key={sub.id}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1"
              >
                <input
                  type="checkbox"
                  checked={selectedSubCategories.includes(sub.name)}
                  onChange={() => onToggleSubCategory(sub.name)}
                  className="rounded border-gray-300 text-[#006d44]"
                />
                {sub.imageUrl ? (
                  <Image
                    src={sub.imageUrl}
                    alt={sub.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded object-cover shrink-0"
                  />
                ) : (
                  <span className="w-6 h-6 rounded bg-gray-100 shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {sub.name.charAt(0)}
                  </span>
                )}
                {sub.name}
              </label>
            ))}
          </div>
          {filteredSubs.length > VISIBLE_LIMIT && (
            <p className="text-xs text-[#006d44] font-semibold mt-2">
              {filteredSubs.length - VISIBLE_LIMIT} MORE
            </p>
          )}
        </div>
      )}

      <div>
        <h3 className="font-bold text-gray-900 mb-3">Min. order</h3>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            placeholder="Pieces"
            value={minOrder}
            onChange={(e) => onMinOrderChange(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#006d44]"
          />
          <button
            type="button"
            onClick={onApplyMinOrder}
            className="px-3 py-2 bg-[#006d44] text-white text-xs font-bold rounded-lg hover:bg-[#005a36]"
          >
            ADD
          </button>
        </div>
      </div>

      {colors.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Color</h3>
          <div className="space-y-2">
            {visibleColors.map((color) => (
              <label key={color.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color.id)}
                  onChange={() => onToggleColor(color.id)}
                  className="rounded border-gray-300 text-[#006d44]"
                />
                <span
                  className="w-4 h-4 rounded-full border border-gray-200 shrink-0"
                  style={{ backgroundColor: color.hexCode || '#e5e7eb' }}
                />
                {color.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {materials.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Material</h3>
          <div className="space-y-2">
            {visibleMaterials.map((material) => (
              <label key={material.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(material.id)}
                  onChange={() => onToggleMaterial(material.id)}
                  className="rounded border-gray-300 text-[#006d44]"
                />
                {material.name}
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
