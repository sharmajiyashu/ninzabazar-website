'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'
import { ROUTES } from '@/lib/routes'
import { UserProps } from '@/app/types/type'
import { DeleteAccountDialog } from './delete-account-dialog'

const NAV_ITEMS = [
  { label: 'My Profile', href: ROUTES.buyer.account, exact: true },
  { label: 'Dashboard', href: ROUTES.buyer.accountDashboard, exact: true },
  { label: 'Privacy Policy', href: ROUTES.legal.privacy, exact: false },
  { label: 'Terms & Conditions', href: ROUTES.legal.terms, exact: false },
  { label: 'Help & Support', href: ROUTES.about, exact: false },
] as const

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname.startsWith(href)
}

export function ProfileSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const { data: user } = useQuery<UserProps>({
    queryKey: ['user', session?.user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/getUser?id=${session?.user.id}`)
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
    enabled: !!session?.user?.id,
  })

  const displayName =
    user?.email?.split('@')[0] ||
    session?.user?.email?.split('@')[0] ||
    session?.user?.name ||
    'User'

  return (
    <aside className="w-full shrink-0 lg:w-[280px]">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-100">
            <Image
              src={user?.profilePicture || '/default-user-img.jpg'}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500">Hello,</p>
            <p className="truncate text-sm font-semibold text-gray-900">
              {displayName}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                'block rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                active
                  ? 'border-[#006d44] bg-[#006d44] text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-[#006d44]/30 hover:bg-gray-50'
              )}
            >
              {item.label}
            </Link>
          )
        })}
        <DeleteAccountDialog />
      </nav>
    </aside>
  )
}
