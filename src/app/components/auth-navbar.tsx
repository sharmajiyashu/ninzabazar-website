import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const AuthNavBar = () => {
  const pathname = usePathname()
  if (pathname === '/login' && '/seller/login') {
    return (
      <header className="flex items-center justify-between px-6 py-6 border-b border-gray-200 shadow md:px-16 lg:px-40">
        <Link href={'/'}>
          <h1 className="text-3xl font-black md:font-bold text-green md:text-3xl mr-2 md:mr-0">
            <span className="hidden md:block">
              Ninja Bazaar
              <span className="font-normal text-black text-2xl mx-1">
                | Log in
              </span>
            </span>
            <span className="md:hidden flex items-center">
              NB
              <span className="font-normal text-black text-2xl mx-1">
                | Log in
              </span>
            </span>
          </h1>
        </Link>
      </header>
    )
  }

  if (pathname === '/signup' && '/seller/signup') {
    return (
      <header className="flex items-center justify-between px-6 py-6 border-b border-gray-200 shadow md:px-16 lg:px-40">
        <Link href={'/'}>
          <h1 className="text-3xl font-black md:font-bold text-green md:text-3xl mr-2 md:mr-0">
            <span className="hidden md:block">
              Ninja Bazaar
              <span className="font-normal text-black text-2xl mx-1">
                | Sign up
              </span>
            </span>
            <span className="md:hidden flex items-center">
              NB
              <span className="font-normal text-black text-2xl mx-1">
                | Sign up
              </span>
            </span>
          </h1>
        </Link>
      </header>
    )
  }
}

export default AuthNavBar
