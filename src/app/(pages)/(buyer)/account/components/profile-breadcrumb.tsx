'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '@/lib/routes'

type Crumb = { label: string; href?: string }

type ProfileBreadcrumbProps = {
  items: Crumb[]
}

export function ProfileBreadcrumb({ items }: ProfileBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500"
    >
      <Link href={ROUTES.home} className="font-medium text-[#006d44] hover:underline">
        Ninja Bazaar
      </Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
          {item.href ? (
            <Link href={item.href} className="text-[#006d44] hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
