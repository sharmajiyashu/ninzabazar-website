import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from './layout-wrapper'
import { Toaster } from '@/components/ui/sonner'
import SessionWrapper from '@/components/session-wrapper'
import { ReactQueryProvider } from '@/components/react-query-provider'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Ninja Bazaar',
  description: 'Your Partner in Business | Marketplace | Supplier',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionWrapper>
      <ReactQueryProvider>
        <html lang="en">
          <body className="min-h-screen antialiased" suppressHydrationWarning>
            <Suspense
              fallback={
                <div className="container mx-auto px-4 py-10">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
                  </div>
                </div>
              }
            >
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster richColors position="bottom-right" />
            </Suspense>
          </body>
        </html>
      </ReactQueryProvider>
    </SessionWrapper>
  )
}
