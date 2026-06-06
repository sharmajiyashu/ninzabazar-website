'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ProductDataProps, UserProps } from '@/app/types/type'
import { useSession } from 'next-auth/react'
import { useBuyerConversations } from '@/app/hooks/useConversation'
import { Conversation } from '@/app/types/type'

const SellerCard = () => {
  const params = useParams()
  const id = params.id
  const router = useRouter()
  const { data: session } = useSession()
  const { data: currentProduct } = useQuery<ProductDataProps>({
    queryKey: ['currentProduct', id],
    queryFn: async () => {
      const res = await axios.get(`/api/product-details/get?id=${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: seller } = useQuery<UserProps>({
    queryKey: ['seller', currentProduct?.seller.userId],
    queryFn: async () => {
      const res = await axios.get(
        `/api/getUser?id=${currentProduct?.seller.userId}`
      )
      return res.data
    },
    enabled: !!currentProduct?.seller.userId,
  })

  const { data: conversations } = useBuyerConversations(
    session?.user.id as string
  )

  const avgRating = () => {
    if (
      !seller?.sellerProfile?.storeRatingSummary &&
      !seller?.sellerProfile?.storeRatingSummary?.average
    ) {
      return 0
    }
    return seller?.sellerProfile?.storeRatingSummary?.average.toFixed(1)
  }

  const handleMessageSeller = () => {
    const existingConversation = conversations?.find(
      (conv: Conversation) => conv.seller?.id === seller?.id
    )
    console.log(existingConversation)

    if (existingConversation) {
      router.push(`/messages?xcnv=${existingConversation.id}`)
    } else {
      router.push(
        `/messages?sellerId=${seller?.id}&productId=${currentProduct?.id}&companyName=${encodeURIComponent(seller?.sellerProfile?.companyName ?? 'ShopNameNull')}&productName=${encodeURIComponent(currentProduct?.name ?? 'ProductNull')}`
      )
    }
  }

  return (
    <div className="justify-center px-6 py-6 border mt-30 mb-14 border-stone-300 rounded-xl">
      <div className="flex flex-row items-center justify-between">
        {/* MOBILE */}
        <div className="flex md:hidden items-center gap-6">
          <div className="w-16 h-16 relative">
            <Image
              src={seller?.profilePicture ?? '/placeholder.png'}
              alt="userimg"
              className="rounded-full"
              quality={100}
              fill
            />
          </div>

          <div>
            <a className="text-xl font-semibold">
              {seller?.sellerProfile?.companyName}
            </a>
            <div className="flex flex-row items-center pt-3 space-x-3">
              <Button
                onClick={() => handleMessageSeller()}
                className="bg-green border-2 border-green text-white px-5 py-3 rounded-lg text-[13px] hover:bg-white hover:text-green hover:border-2 hover:border-green"
              >
                Message Seller
              </Button>
              {seller?.id && (
                <Link href={`/store/${seller?.sellerProfile?.id}`}>
                  <Button className="bg-green border-2 border-green text-white px-8 py-3 rounded-lg text-[13px] hover:bg-white hover:text-green hover:border-2 hover:border-green">
                    View Shop
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 relative">
              <Image
                src={seller?.profilePicture || '/placeholder.png'}
                alt={
                  seller?.sellerProfile?.companyName ||
                  seller?.sellerProfile?.businessRegisteredName +
                    ' profile picture'
                }
                className="rounded-full border border-stone-300 border-solid object-cover"
                fill
              />
            </div>

            <div>
              <a className="text-xl font-semibold">
                {seller?.sellerProfile?.companyName ||
                  seller?.sellerProfile?.businessRegisteredName}
              </a>
              <div className="flex flex-row items-center pt-3 space-x-3">
                <Button
                  onClick={() => handleMessageSeller()}
                  className="bg-green border-2 border-green text-white px-5 py-3 rounded-lg text-[13px] hover:bg-white hover:text-green hover:border-2 hover:border-green"
                >
                  Message Seller
                </Button>
                {seller?.id && (
                  <Link href={`/store/${seller?.sellerProfile?.id}`}>
                    <Button className="bg-green border-2 border-green text-white px-8 py-3 rounded-lg text-[13px] hover:bg-white hover:text-green hover:border-2 hover:border-green">
                      View Shop
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 text-left">
            <span className="text-[15px] text-stone-400">{avgRating()}</span>
            <span>
              Joined:{' '}
              {seller?.createdAt
                ? new Date(seller.createdAt).toLocaleDateString()
                : ''}
            </span>
            <span>Products: {seller?.sellerProfile?.products.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerCard
