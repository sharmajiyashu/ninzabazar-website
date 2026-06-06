'use client'
import React, { useEffect, useRef, useState } from 'react'
import { User, ShoppingCart, Search, ChevronDown } from 'lucide-react'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
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

const NavBar = () => {
  const cart = useCartStore((state) => state.cart)

  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchResults, setSearchResults] = useState<[]>([])
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const { data: session } = useSession()
  const router = useRouter()

  const { data: user } = useQuery<UserProps>({
    queryKey: ['user', session?.user.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
  })

  const performSearch = async () => {
    try {
      if (!searchQuery) return
      const searchProduct = await axios.get(`/api/products?q=${searchQuery}`)
      setSearchResults(searchProduct.data)
      setShowDropdown(true)
      console.log(searchProduct.data)
      return searchProduct.data
    } catch (error) {
      console.log(error)
      throw new Error('Failed to search products')
    }
  }
  // debounce 3s
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
    router.push(`/products?query=${encodeURIComponent(query)}`)
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

  return (
    <header className="bg-white border-b border-[#DDDDDD] shadow-[0px_4px_4px_rgba(0,0,0,0.05)] w-full select-none transition-all duration-300">
      <div 
        className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between w-full h-[134px]"
        style={{ boxSizing: 'border-box' }}
      >
      {/* Name / Logo group (Group 1171277265) */}
      <div className="flex items-center gap-4">
        <Link href={'/'}>
          <h1
            className="text-[#006d44] select-none cursor-pointer"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '40px',
              lineHeight: '36px',
              letterSpacing: '0em'
            }}
          >
            Ninja Bazaar
          </h1>
        </Link>


        {/* All Cities Location Picker */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#eaf4fe] text-[#006d44] border border-[#d6e9fd] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer hover:bg-[#dbeafe] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          All Cities
        </div>
      </div>

      {/* Search Bar Group */}
      <div className="relative flex items-center w-full max-w-[431px] h-[50px] border border-gray-200 bg-white rounded-lg overflow-hidden focus-within:border-[#006d44] text-sm">
        <input
          type="text"
          placeholder="Search Event, Industry Or Location"
          className="pl-4 pr-[70px] w-full h-full focus:outline-none text-gray-700 placeholder-gray-400 font-semibold"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleOnEnter}
        />
        <button
          onClick={() => handleSearch(searchQuery)}
          className="absolute right-0 top-0 bottom-0 text-white flex items-center justify-center w-[58px] h-full cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            background: 'linear-gradient(270deg, #007451 0%, #00DA98 155.17%)'
          }}
        >
          <Search size={18} />
        </button>



        {showDropdown && searchResults.length > 0 && (
          <div
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden bg-white border rounded-md shadow-lg border-green"
            style={{ top: '100%' }}
            ref={dropdownRef}
          >
            {searchResults.map((keywords, index) => (
              <div
                key={index}
                className="px-4 py-2 transition-colors cursor-pointer hover:bg-green hover:text-white"
              >
                <p
                  className="text-green hover:text-white"
                  onClick={() => handleSearch(keywords)}
                >
                  {keywords}
                </p>
              </div>
            ))}
          </div>
        )}
        {showDropdown && searchQuery.length > 0 && searchResults.length <= 0 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden bg-white border rounded-md shadow-lg top-full border-green"
          >
            <h1 className="p-4 text-green">{`${searchQuery} not found`}</h1>
          </div>
        )}
      </div>

      {/* Grid icon & Login Button group (Group 1171277272) */}
      <div className="flex items-center gap-5">
        {/* Grid menu icon */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors hidden md:block">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
          </svg>
        </button>

        {/* Cart */}
        <Link
          href="/cart"
          className="relative flex items-center justify-center p-2 text-gray-500 hover:text-[#006d44] transition-colors"
        >
          <ShoppingCart size={22} />
          {totalItems > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full min-w-[20px]">
              {totalItems > 99 ? '99+' : totalItems}
            </div>
          )}
        </Link>

        {/* Desktop Login button / Avatar dropdown */}
        {!session ? (
          <Link
            href="/login"
            className="w-[177px] h-[50px] flex items-center justify-center gap-2 rounded-lg bg-[#006d44] hover:bg-[#005a36] text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-green-900/10 cursor-pointer active:scale-95"
          >
            <User size={16} />
            <span>Login/Sing up</span>
          </Link>
        ) : (
          <DropdownMenu
            open={desktopMenuOpen}
            onOpenChange={setDesktopMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <div className="relative flex items-center gap-2 cursor-pointer">
                <Avatar
                  sx={{ width: 40, height: 40 }}
                  className="rounded-full shadow-md border-2 border-white"
                >
                  <Image
                    width={40}
                    height={40}
                    src={user?.profilePicture || '/default-user-img.jpg'}
                    alt="User"
                  />
                </Avatar>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="absolute z-45 w-40 py-2 bg-white border border-gray-200 rounded-lg shadow-lg top-2 -right-8">
              <DropdownMenuLabel className="px-4 py-2 font-semibold text-gray-700">
                Welcome {session.user?.name}!
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <Link href="/account">
                <DropdownMenuItem className="px-4 py-2 text-gray-600 rounded-md cursor-pointer hover:bg-gray-100">
                  Profile
                </DropdownMenuItem>
              </Link>

              <Link href="/messages">
                <DropdownMenuItem className="px-4 py-2 text-gray-600 rounded-md cursor-pointer hover:bg-gray-100">
                  Messages
                </DropdownMenuItem>
              </Link>

              <Link href="/orders">
                <DropdownMenuItem className="px-4 py-2 text-gray-600 rounded-md cursor-pointer hover:bg-gray-100">
                  Orders
                </DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 text-red-600 rounded-md cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      </div>
    </header>

  )
}

export default NavBar
