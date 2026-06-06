'use client'

import React, { useState, useEffect } from 'react'
import { DashboardSidebar } from './dashboard-sidebar'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  IconChevronDown,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
} from '@tabler/icons-react'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const { data: session } = useSession()

  const mainRef = React.useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  const displayName = session?.user?.name || session?.user?.email || '—'
  const displayRole = session?.user?.role || 'Seller'

  return (
    <div className="seller-theme flex fixed inset-0 overflow-hidden bg-background">
      <aside
        className={`shrink-0 overflow-hidden transition-[width] duration-500 ease-out ${sidebarOpen ? 'w-64' : 'w-0'
          }`}
      >
        <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
          <DashboardSidebar />
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 shadow-sm sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen((o: boolean) => !o)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          >
            {sidebarOpen ? (
              <IconLayoutSidebarLeftCollapse className="h-5 w-5" aria-hidden />
            ) : (
              <IconLayoutSidebarLeftExpand className="h-5 w-5" aria-hidden />
            )}
          </button>
          <div className="flex flex-1 items-center justify-end gap-4">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-muted"
                aria-label="User Menu"
              >
                <span className="max-w-[140px] truncate sm:max-w-[180px]">
                  {displayName}
                </span>
                <IconChevronDown
                  className="h-4 w-4 shrink-0 opacity-60"
                  aria-hidden
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[180px] rounded-lg border border-border bg-background p-1 shadow-lg z-50"
                  sideOffset={6}
                  align="end"
                >
                  <div className="px-2 py-2">
                    <div className="text-sm font-medium text-foreground">
                      {displayName}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {displayRole}
                    </div>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                    onSelect={() => signOut()}
                  >
                    <IconLogout className="h-4 w-4" aria-hidden />
                    Log out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>
        <main
          ref={mainRef}
          className="min-h-0 flex-1 overflow-auto p-6"
          id="main-content"
        >
          <div
            key={pathname}
            className="mx-auto max-w-7xl w-full animate-in fade-in duration-200"
          >
            {children}
          </div>
        </main>
        <footer
          className="shrink-0 border-t border-border bg-card px-4 py-3 sm:px-6"
          role="contentinfo"
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              © {new Date().getFullYear()} Ninja Bazaar
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
