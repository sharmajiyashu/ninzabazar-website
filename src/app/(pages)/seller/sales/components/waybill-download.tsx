'use client'

import { saveAs } from 'file-saver'
import { pdf } from '@react-pdf/renderer'
import { WaybillPDF } from './waybill-pdf'
import { Order, UserProps } from '@/app/types/type'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const WaybillDownload = ({ order }: { order: Order }) => {
  const { data: session } = useSession()

  const { data: user } = useQuery({
    queryKey: ['sellerProfile', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const res = await axios.get<UserProps>(
        `/api/getUser?id=${session?.user.id}`
      )
      return res.data
    },
  })

  const sellerName =
    user?.sellerProfile?.companyName ||
    user?.sellerProfile?.businessRegisteredName ||
    'Seller'

  const getSellerPickupAddress = () => {
    const pickup = user?.sellerProfile?.pickupAddress

    if (!pickup) return 'N/A'

    // If it's a single address object
    if (!Array.isArray(pickup)) {
      return `${pickup.street}, ${pickup.city}, ${pickup.state}, ${pickup.postalCode}, ${pickup.country}`
    }

    // If it's an array, find the default
    const address = pickup.find((addr) => addr.isDefault)

    if (!address) return 'N/A'

    return `${address.street}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`
  }

  const getBuyerAddress = () => {
    const a = order.shippingAddress
    return a
      ? `${a.street}, ${a.city}, ${a.state}, ${a.postalCode}, ${a.country}`
      : 'N/A'
  }

  const handleDownload = async () => {
    const blob = await pdf(
      <WaybillPDF
        order={order}
        sellerName={sellerName}
        sellerAddress={getSellerPickupAddress()}
        buyerAddress={getBuyerAddress()}
      />
    ).toBlob()

    saveAs(blob, `waybill-${order.id}.pdf`)
  }

  return (
    <button
      onClick={handleDownload}
      className="w-full text-center text-sm text-black hover:bg-gray-100 px-2 py-1"
    >
      Print Label
    </button>
  )
}

export default WaybillDownload
