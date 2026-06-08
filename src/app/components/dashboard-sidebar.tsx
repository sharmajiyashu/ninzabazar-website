'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import * as Collapsible from '@radix-ui/react-collapsible'
import {
  IconChevronDown,
  IconLogout,
  IconLayoutDashboard,
  IconShoppingCart,
  IconTag,
  IconCreditCard,
  IconHelp,
} from '@tabler/icons-react'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { signOut } from 'next-auth/react'
import { ROUTES, matchesPath } from '@/lib/routes'

export interface SidebarNavItem {
  title: string
  href: string
  icon?: React.ElementType
}

export interface SidebarNavSection {
  title: string
  href: string
  items: SidebarNavItem[]
  icon?: React.ElementType
}

export type SidebarNavEntry = SidebarNavItem | SidebarNavSection

export function isNavSection(
  item: SidebarNavEntry
): item is SidebarNavSection {
  return 'items' in item && Array.isArray((item as SidebarNavSection).items)
}

const sidebarNav: SidebarNavEntry[] = [
  { title: 'Home', href: ROUTES.seller.dashboard, icon: IconLayoutDashboard },
  { title: 'Products', href: ROUTES.seller.products, icon: IconShoppingCart },
  { title: 'Orders', href: ROUTES.seller.sales, icon: IconTag },
  { title: 'Payments', href: ROUTES.seller.payment, icon: IconCreditCard },
  { title: 'Help', href: ROUTES.about, icon: IconHelp },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    {}
  )

  const handleLogout = () => {
    signOut()
  }

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link
          href={ROUTES.home}
          aria-label="Ninja Bazaar — go to homepage"
          className="flex min-w-0 items-center gap-2.5 transition-transform hover:opacity-90 active:scale-[0.98]"
        >
          <Image
            src="/img/authentication/shopping_cart_3d.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
          />
          <span className="text-xl font-bold text-primary">Ninja Bazaar</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto no-scrollbar">
        {sidebarNav.map((item) => {
          const hasItems = isNavSection(item)
          const Icon = item.icon
          const href = item.href
          const title = item.title

          if (!hasItems) {
            const isActive = matchesPath(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                scroll={false}
                className={twMerge(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )}
              >
                {Icon && (
                  <Icon
                    className={twMerge(
                      'h-5 w-5 shrink-0 transition-transform group-hover:scale-110',
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                )}
                <span>{title}</span>
              </Link>
            )
          }

          const isOpen = openSections[href] ?? pathname.startsWith(href)
          return (
            <Collapsible.Root
              key={href}
              open={isOpen}
              onOpenChange={(open) =>
                setOpenSections((prev) => ({ ...prev, [href]: open }))
              }
              className="space-y-1"
            >
              <Collapsible.Trigger
                className={twMerge(
                  'group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                  'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
                  isOpen && 'bg-sidebar-accent/50 text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <Icon
                      className={twMerge(
                        'h-5 w-5 shrink-0 transition-transform group-hover:scale-110',
                        isOpen
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                  )}
                  <span>{title}</span>
                </div>
                <IconChevronDown
                  className={twMerge(
                    'h-4 w-4 shrink-0 transition-transform duration-300 opacity-50',
                    isOpen && 'rotate-180 opacity-100'
                  )}
                />
              </Collapsible.Trigger>
              <Collapsible.Content className="overflow-hidden animate-in slide-in-from-top-2 duration-300">
                <div className="ml-5 mt-1 border-l-2 border-primary/10 pl-4 space-y-1">
                  {item.items.map((sub) => {
                    const subActive = pathname === sub.href
                    const SubIcon = sub.icon
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        scroll={false}
                        className={twMerge(
                          'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                          subActive
                            ? 'font-semibold text-primary bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                        )}
                      >
                        {SubIcon && (
                          <SubIcon
                            className={twMerge(
                              'h-4 w-4 shrink-0',
                              subActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                          />
                        )}
                        {sub.title}
                      </Link>
                    )
                  })}
                </div>
              </Collapsible.Content>
            </Collapsible.Root>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="mt-auto p-4 border-t border-sidebar-border/50">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <IconLogout className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
