'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import NavBar from './components/nav-bar'
import Footer from './components/footer'
import { DashboardShell } from './components/dashboard-shell'
import { SellerRouteGuard } from './components/seller-route-guard'
import { useSession } from 'next-auth/react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { ROUTES, isAuthRoute, isSellerRoute } from '@/lib/routes'

type LayoutShell = 'auth' | 'seller' | 'public'

function resolveShell(pathname: string, role?: string): LayoutShell {
  if (isAuthRoute(pathname)) return 'auth'
  if (isSellerRoute(pathname)) return 'seller'
  if (role === 'SELLER' && pathname !== ROUTES.home) return 'seller'
  return 'public'
}

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession()
  const pathname = usePathname()

  const shell = useMemo(
    () => resolveShell(pathname, session?.user?.role),
    [pathname, session?.user?.role]
  )

  const withDates = (content: React.ReactNode) => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>{content}</LocalizationProvider>
  )

  if (shell === 'auth') {
    return withDates(children)
  }

  if (shell === 'seller') {
    return withDates(
      <SellerRouteGuard>
        <DashboardShell>{children}</DashboardShell>
      </SellerRouteGuard>
    )
  }

  return withDates(
    <div className="flex min-h-screen min-w-0 flex-col">
      <NavBar />
      <main className="min-w-0 flex-1 animate-fade-in-soft">{children}</main>
      <Footer />
    </div>
  )
}

export default LayoutWrapper
