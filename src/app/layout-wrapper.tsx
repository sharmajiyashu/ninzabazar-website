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

  if (isAuthRoute)
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
    )


  if (status === 'loading' || !session) {
    return (
      <>
        <NavBar />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {children}
        </LocalizationProvider>
        <Footer />
      </>
    )
  }

  const userRole = session?.user?.role

  if (userRole === 'SELLER') {
    return (
      <DashboardShell>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {children}
        </LocalizationProvider>
      </DashboardShell>
    )
  }

  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  )
}

export default LayoutWrapper
