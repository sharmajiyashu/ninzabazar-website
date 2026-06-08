'use client'

import React from 'react'
import CategoryArchItem from './sub-components/category-arch-item'

type CategoryData = {
  id: string
  name: string
  imageUrl?: string | null
}

type TrendingCategoriesProps = {
  title: string
  subtitle?: string | null
  categories: CategoryData[]
}

const sectionTitleClass =
  "select-none text-[#181A20] text-xl sm:text-2xl md:text-[28px] font-semibold"

const TrendingCategories = ({ title, subtitle, categories }: TrendingCategoriesProps) => {
  if (categories.length === 0) return null

  return (
    <section className="w-full font-sans py-2 md:py-4 border-t border-gray-100">
      <div className="mb-5 md:mb-8">
        <h2 className={sectionTitleClass} style={{ fontFamily: "'Poppins', sans-serif" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-500 mt-2 text-sm md:text-base">{subtitle}</p>
        )}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="flex md:hidden gap-5 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar -mx-1 px-1">
        {categories.map((item, index) => (
          <div key={item.id} className="shrink-0 w-[42vw] max-w-[160px] snap-start">
            <CategoryArchItem
              name={item.name}
              imageUrl={item.imageUrl}
              href={`/products?category=${encodeURIComponent(item.name)}`}
              colorIndex={index}
              size="lg"
            />
          </div>
        ))}
      </div>

      {/* Tablet & desktop: 2 cols on sm, 4 cols on md+ (matches mockup) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 xl:gap-12">
        {categories.map((item, index) => (
          <CategoryArchItem
            key={item.id}
            name={item.name}
            imageUrl={item.imageUrl}
            href={`/products?category=${encodeURIComponent(item.name)}`}
            colorIndex={index}
            size="lg"
          />
        ))}
      </div>
    </section>
  )
}

export default TrendingCategories
