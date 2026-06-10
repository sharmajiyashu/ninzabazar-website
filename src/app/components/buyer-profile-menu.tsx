'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import Avatar from '@mui/material/Avatar'
import { signOutAsBuyer } from '@/lib/auth-actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/lib/routes'

type BuyerProfileMenuProps = {
  userName?: string | null
  profilePicture?: string | null
  avatarSize: number
  menuId: string
}

export function BuyerProfileMenu({
  userName,
  profilePicture,
  avatarSize,
  menuId,
}: BuyerProfileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          id={menuId}
          aria-label="Open account menu"
          className="flex items-center gap-1 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#006d44] focus-visible:ring-offset-2"
        >
          <Avatar sx={{ width: avatarSize, height: avatarSize }}>
            <Image
              width={avatarSize}
              height={avatarSize}
              src={profilePicture || '/default-user-img.jpg'}
              alt={userName ? `${userName}'s profile` : 'User profile'}
              className="rounded-full object-cover"
            />
          </Avatar>
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-50 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
      >
        <DropdownMenuLabel className="px-4 py-2 font-semibold text-gray-700">
          Welcome {userName}!
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer px-4 py-2 text-gray-600">
          <Link href={ROUTES.buyer.account} onClick={() => setOpen(false)}>
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer px-4 py-2 text-gray-600">
          <Link href={ROUTES.buyer.messages} onClick={() => setOpen(false)}>
            Messages
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer px-4 py-2 text-gray-600">
          <Link href={ROUTES.buyer.orders} onClick={() => setOpen(false)}>
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setOpen(false)
            void signOutAsBuyer()
          }}
          className="cursor-pointer px-4 py-2 text-red-600 focus:text-red-600"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
