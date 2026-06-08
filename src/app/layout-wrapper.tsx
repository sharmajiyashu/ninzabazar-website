'use client'

import { usePathname } from 'next/navigation'
import NavBar from './components/nav-bar'
import Footer from './components/footer'
import { DashboardShell } from './components/dashboard-shell'
import { useSession } from 'next-auth/react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const noHeaderFooterRoutes = [
    '/login',
    '/signup',
    '/seller/login',
    '/seller/signup',
  ]
  const isAuthRoute = noHeaderFooterRoutes.includes(pathname)

  if (isAuthRoute) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
    )
  }

  if (status === 'loading' || !session) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="flex min-h-screen min-w-0 flex-col">
          <NavBar />
          <main className="min-w-0 flex-1 animate-fade-in-soft">{children}</main>
          <Footer />
        </div>
      </LocalizationProvider>
    )
  }

  const userRole = session?.user?.role
  const isPublicHome = pathname === '/'

  if (userRole === 'SELLER' && !isPublicHome) {
    return (
      <DashboardShell>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {children}
        </LocalizationProvider>
      </DashboardShell>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex min-h-screen min-w-0 flex-col">
        <NavBar />
        <main className="min-w-0 flex-1 animate-fade-in-soft">{children}</main>
        <Footer />
      </div>
    </LocalizationProvider>
  )
}

export default LayoutWrapper
