'use client'

import { usePathname } from 'next/navigation'
import NavBar from './components/nav-bar'
import Footer from './components/footer'
import { DashboardShell } from './components/dashboard-shell'
import { useSession } from 'next-auth/react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const AUTH_ROUTES = ['/login', '/signup', '/seller/login', '/seller/signup']

function isSellerRoute(pathname: string) {
  return pathname.startsWith('/seller') && !AUTH_ROUTES.includes(pathname)
}

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession()
  const pathname = usePathname()

  const withDates = (content: React.ReactNode) => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>{content}</LocalizationProvider>
  )

  if (AUTH_ROUTES.includes(pathname)) {
    return withDates(children)
  }

  if (isSellerRoute(pathname)) {
    return withDates(<DashboardShell>{children}</DashboardShell>)
  }

  const userRole = session?.user?.role
  const isPublicHome = pathname === '/'

  if (userRole === 'SELLER' && !isPublicHome) {
    return withDates(<DashboardShell>{children}</DashboardShell>)
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
