'use client'
import React, { useEffect, useRef, useState } from 'react'
import { User, ShoppingCart, Search, ChevronDown } from 'lucide-react'

import Link from 'next/link'
import { signOutAsBuyer } from '@/lib/auth-actions'
import { useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Avatar from '@mui/material/Avatar'
import Image from 'next/image'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import useCartStore from '../store/cart-store'
import { CartItem, UserProps } from '../types/type'
import { useQuery } from '@tanstack/react-query'
import { ROUTES, productsPath } from '@/lib/routes'

const NavBar = () => {
  const cart = useCartStore((state) => state.cart)

  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchResults, setSearchResults] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const { data: session } = useSession()
  const router = useRouter()

  const { data: user } = useQuery<UserProps>({
    queryKey: ['user', session?.user.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
    enabled: !!session?.user?.id,
  })

  const performSearch = async () => {
    try {
      if (!searchQuery) return
      const searchProduct = await axios.get(`/api/products?q=${searchQuery}`)
      setSearchResults(searchProduct.data)
      setShowDropdown(true)
      return searchProduct.data
    } catch (error) {
      console.log(error)
      throw new Error('Failed to search products')
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch()
      }
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handleSearch = (query: string) => {
    router.push(productsPath({ query }))
    setShowDropdown(false)
  }

  const handleOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery)
    }
  }

  const totalItems = cart.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  )

  useEffect(() => {
    if (searchQuery.length === 0) {
      setShowDropdown(false)
    }
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const searchDropdown = showDropdown && (
    <div
      ref={dropdownRef}
      className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border border-green bg-white shadow-lg"
    >
      {searchResults.length > 0 ? (
        searchResults.map((keywords, index) => (
          <div
            key={index}
            className="cursor-pointer px-4 py-2 transition-colors hover:bg-green hover:text-white"
            onClick={() => handleSearch(keywords)}
          >
            <p className="text-green hover:text-white">{keywords}</p>
          </div>
        ))
      ) : searchQuery.length > 0 ? (
        <h1 className="p-4 text-green">{`${searchQuery} not found`}</h1>
      ) : null}
    </div>
  )

  return (
    <header className="sticky top-0 z-40 w-full select-none border-b border-[#DDDDDD] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-4 lg:px-5">
        {/* Mobile: logo + actions row */}
        <div className="flex items-center justify-between gap-3 py-3 md:hidden">
          <Link
            href={ROUTES.home}
            aria-label="Ninja Bazaar — go to homepage"
            className="min-w-0 shrink transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            <h1 className="truncate font-bold text-[#006d44] text-xl sm:text-2xl">
              Ninja Bazaar
            </h1>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={ROUTES.buyer.cart}
              className="relative flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:text-[#006d44]"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <div className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </div>
              )}
            </Link>
            {!session ? (
              <Link
                href={ROUTES.auth.login}
                className="flex h-10 items-center justify-center rounded-lg bg-[#006d44] px-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#005a36] active:scale-95"
              >
                <User size={16} />
              </Link>
            ) : (
              <DropdownMenu
                open={desktopMenuOpen}
                onOpenChange={setDesktopMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex items-center gap-1">
                    <Avatar sx={{ width: 36, height: 36 }}>
                      <Image
                        width={36}
                        height={36}
                        src={user?.profilePicture || '/default-user-img.jpg'}
                        alt="User"
                      />
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-50 w-44 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                >
                  <DropdownMenuLabel className="px-4 py-2 font-semibold text-gray-700">
                    Welcome {session.user?.name}!
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={ROUTES.buyer.account}>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  <Link href={ROUTES.buyer.messages}>
                    <DropdownMenuItem>Messages</DropdownMenuItem>
                  </Link>
                  <Link href={ROUTES.buyer.orders}>
                    <DropdownMenuItem>Orders</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    onClick={() => void signOutAsBuyer()}
                    className="text-red-600"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile: full-width search */}
        <div className="relative mb-3 md:hidden">
          <div className="relative flex h-11 w-full items-center overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:border-[#006d44]">
            <input
              type="text"
              placeholder="Search products..."
              className="h-full w-full pl-4 pr-14 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleOnEnter}
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="absolute bottom-0 right-0 top-0 flex w-12 items-center justify-center text-white transition-opacity hover:opacity-90"
              style={{
                background:
                  'linear-gradient(270deg, #007451 0%, #00DA98 155.17%)',
              }}
            >
              <Search size={18} />
            </button>
          </div>
          {searchDropdown}
        </div>

        {/* Desktop layout */}
        <div className="hidden h-[134px] items-center justify-between gap-6 md:flex">
          <div className="flex min-w-0 shrink-0 items-center gap-4">
            <Link
              href={ROUTES.home}
              aria-label="Ninja Bazaar — go to homepage"
              className="transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <h1 className="font-bold text-[#006d44] text-3xl lg:text-[40px] leading-tight">
                Ninja Bazaar
              </h1>
            </Link>
            <div className="hidden items-center gap-1.5 rounded-lg border border-[#d6e9fd] bg-[#eaf4fe] px-3 py-2 text-xs font-bold text-[#006d44] transition-colors hover:bg-[#dbeafe] lg:flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              All Cities
            </div>
          </div>

          <div className="relative mx-4 flex h-[50px] min-w-0 flex-1 max-w-[431px] items-center overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:border-[#006d44]">
            <input
              type="text"
              placeholder="Search Event, Industry Or Location"
              className="h-full w-full pl-4 pr-[70px] text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleOnEnter}
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="absolute bottom-0 right-0 top-0 flex w-[58px] items-center justify-center text-white transition-opacity hover:opacity-90"
              style={{
                background:
                  'linear-gradient(270deg, #007451 0%, #00DA98 155.17%)',
              }}
            >
              <Search size={18} />
            </button>
            {searchDropdown}
          </div>

          <div className="flex shrink-0 items-center gap-4 lg:gap-5">
            <button
              type="button"
              className="hidden text-gray-400 transition-colors hover:text-gray-600 lg:block"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
              </svg>
            </button>

            <Link
              href={ROUTES.buyer.cart}
              className="relative flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:text-[#006d44]"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <div className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </div>
              )}
            </Link>

            {!session ? (
              <Link
                href={ROUTES.auth.login}
                className="flex h-[50px] w-auto items-center justify-center gap-2 rounded-lg bg-[#006d44] px-5 text-sm font-bold tracking-wide text-white shadow-md shadow-green-900/10 transition-all hover:bg-[#005a36] active:scale-95 lg:w-[177px]"
              >
                <User size={16} />
                <span className="hidden lg:inline">Login/Sign up</span>
              </Link>
            ) : (
              <DropdownMenu
                open={desktopMenuOpen}
                onOpenChange={setDesktopMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative flex cursor-pointer items-center gap-2"
                  >
                    <Avatar
                      sx={{ width: 40, height: 40 }}
                      className="rounded-full border-2 border-white shadow-md"
                    >
                      <Image
                        width={40}
                        height={40}
                        src={user?.profilePicture || '/default-user-img.jpg'}
                        alt="User"
                      />
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-50 w-44 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                >
                  <DropdownMenuLabel className="px-4 py-2 font-semibold text-gray-700">
                    Welcome {session.user?.name}!
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={ROUTES.buyer.account}>
                    <DropdownMenuItem className="cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-100">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href={ROUTES.buyer.messages}>
                    <DropdownMenuItem className="cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-100">
                      Messages
                    </DropdownMenuItem>
                  </Link>
                  <Link href={ROUTES.buyer.orders}>
                    <DropdownMenuItem className="cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-100">
                      Orders
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    onClick={() => void signOutAsBuyer()}
                    className="cursor-pointer px-4 py-2 text-red-600"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default NavBar
