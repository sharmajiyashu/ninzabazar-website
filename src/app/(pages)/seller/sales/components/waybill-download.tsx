'use client'

import { saveAs } from 'file-saver'
import { pdf } from '@react-pdf/renderer'
import { WaybillPDF } from './waybill-pdf'
import { Order, UserProps } from '@/app/types/type'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { FileDown } from 'lucide-react'

function getSellerPickupAddress(user?: UserProps) {
  const pickup = user?.sellerProfile?.pickupAddress
  if (!pickup) return 'N/A'
  if (!Array.isArray(pickup)) {
    return `${pickup.street}, ${pickup.city}, ${pickup.state}, ${pickup.postalCode}, ${pickup.country}`
  }
  const address = pickup.find((addr) => addr.isDefault)
  if (!address) return 'N/A'
  return `${address.street}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`
}

function getBuyerAddress(order: Order) {
  const a = order.shippingAddress
  return a
    ? `${a.street}, ${a.city}, ${a.state}, ${a.postalCode}, ${a.country}`
    : 'N/A'
}

export function useWaybillDownload(order: Order) {
  const { data: session } = useSession()

  const { data: user } = useQuery({
    queryKey: ['sellerProfile', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const res = await axios.get<UserProps>(`/api/getUser?id=${session?.user.id}`)
      return res.data
    },
  })

  const download = async () => {
    const sellerName =
      user?.sellerProfile?.companyName ||
      user?.sellerProfile?.businessRegisteredName ||
      'Seller'

    const blob = await pdf(
      <WaybillPDF
        order={order}
        sellerName={sellerName}
        sellerAddress={getSellerPickupAddress(user)}
        buyerAddress={getBuyerAddress(order)}
      />
    ).toBlob()

    saveAs(blob, `waybill-${order.id}.pdf`)
  }

  return { download, isReady: !!user }
}

const WaybillDownload = ({ order }: { order: Order }) => {
  const { download } = useWaybillDownload(order)

  return (
    <button
      type="button"
      onClick={download}
      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
    >
      Print Label
    </button>
  )
}

export default WaybillDownload

export { FileDown }
