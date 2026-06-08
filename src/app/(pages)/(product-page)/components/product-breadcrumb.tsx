import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type ProductBreadcrumbProps = {
  category?: { name: string } | null
  subCategory?: { name: string } | null
  productName?: string
}

export default function ProductBreadcrumb({
  category,
  subCategory,
  productName,
}: ProductBreadcrumbProps) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500 py-4">
      <Link href="/" className="hover:text-[#006d44] font-medium text-[#006d44]">
        Ninja Bazaar
      </Link>
      {category && (
        <>
          <ChevronRight size={14} className="shrink-0" />
          <Link
            href={`/products?category=${encodeURIComponent(category.name)}`}
            className="hover:text-[#006d44]"
          >
            {category.name}
          </Link>
        </>
      )}
      {subCategory && (
        <>
          <ChevronRight size={14} className="shrink-0" />
          <Link
            href={`/products?category=${encodeURIComponent(category?.name || '')}&subCategory=${encodeURIComponent(subCategory.name)}`}
            className="hover:text-[#006d44]"
          >
            {subCategory.name}
          </Link>
        </>
      )}
      {productName && (
        <>
          <ChevronRight size={14} className="shrink-0" />
          <span className="text-gray-700 line-clamp-1">{productName}</span>
        </>
      )}
    </nav>
  )
}
