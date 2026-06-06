'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  BadgeCheck,
  Package2,
  Star,
  MessageCircle,
  FileText,
  Calendar,
} from 'lucide-react'
import { Conversation, SellerProfileProps, UserProps } from '@/app/types/type'
import { useBuyerConversations } from '@/app/hooks/useConversation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface BannerProps {
  sellerInfo: SellerProfileProps
}

const Banner = ({ sellerInfo }: BannerProps) => {
  const router = useRouter()
  const { data: session } = useSession()

  const storeName =
    sellerInfo?.companyName || sellerInfo?.businessRegisteredName
  const joinedDate = new Date(sellerInfo.createdAt).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    }
  )
  const isVerified = sellerInfo?.isVerified ?? false
  const rating = sellerInfo?.storeRatingSummary?.average ?? 0
  const formattedRating = rating > 0 ? rating.toFixed(1) : 'New'

  const { data: seller } = useQuery<UserProps>({
    queryKey: ['seller', sellerInfo.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${sellerInfo.user.id}`)
      return res.data
    },
    enabled: !!sellerInfo.id,
  })

  const { data: conversations, isLoading: convLoading } = useBuyerConversations(
    session?.user.id as string
  )

  const handleMessageSeller = () => {
    if (convLoading) return
    const existing = conversations?.find(
      (c: Conversation) => c.seller?.id === sellerInfo.id
    )

    if (existing) {
      router.push(`/messages?xcnv=${existing.id}`)
    } else {
      router.push(
        `/messages?sellerId=${seller?.id}&productId=${'from store'}&companyName=${encodeURIComponent((seller?.sellerProfile?.companyName || seller?.sellerProfile?.businessRegisteredName) ?? 'ShopNameNull')}&productName=${encodeURIComponent('from store')}`
      )
    }
  }

  // // Helper function to format business type in Pascal Case
  // const formatBusinessType = (type: string | undefined) => {
  //   if (!type) return ''
  //   return type
  //     .split(/[\s_-]+/)
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //     .join(' ')
  // }

  const stats = [
    {
      icon: BadgeCheck,
      label: isVerified ? 'Verified Seller' : 'Unverified',
      value: isVerified ? '✓ Verified' : '⚠ Unverified',
      color: isVerified
        ? 'from-green-500 to-emerald-500'
        : 'from-gray-500 to-slate-500',
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: joinedDate,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Package2,
      label: 'Products',
      value: seller?.sellerProfile?.products.length.toString(),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Star,
      label: 'Rating',
      value: formattedRating,
      color: 'from-yellow-500 to-orange-500',
    },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center lg:text-left">
          {/* Profile Image - Simplified */}
          <div className="relative mb-6">
            <div className="w-28 h-28 overflow-hidden rounded-full bg-gray-200">
              <Image
                src={seller?.profilePicture || '/placeholder.png'}
                alt="Seller Logo"
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Store Name - Only show if exists */}
          {storeName && (
            <div className="mb-6">
              <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-2">
                {storeName}
              </h1>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button
              onClick={handleMessageSeller}
              disabled={convLoading || !session}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {convLoading ? 'Loading...' : 'Message Seller'}
            </Button>
            <Button
              disabled
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg opacity-50 cursor-not-allowed"
            >
              <FileText className="w-5 h-5 mr-2" />
              Quote Seller
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 w-full max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map(({ icon: Icon, label, value, color }, index) => (
              <div
                key={index}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 mb-1">
                      {label}
                    </p>
                    <p className="text-lg font-bold text-white truncate">
                      {value}
                    </p>
                  </div>
                </div>

                {/* Special rating stars */}
                {label === 'Rating' && rating > 0 && (
                  <div className="flex items-center mt-3 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : i < rating
                              ? 'text-yellow-400 fill-yellow-400 opacity-50'
                              : 'text-white/30'
                        }`}
                      />
                    ))}
                    <span className="text-white/80 text-sm ml-2">
                      ({rating.toFixed(1)})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Banner
