'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Address = {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

type SellerSidebarProps = {
  productId: string
  productName: string
  seller: {
    id: string
    userId: string
    companyName: string
    shopName?: string | null
    businessRegisteredName?: string | null
    businessPhoneNumber?: string | null
    sellerPhoneNumber?: string | null
    description?: string | null
    gstNumber?: string | null
    registeredAddress?: Address | null
  }
  minOrderQuantity?: number | null
  onContact: (opts?: { quantity?: number }) => void
}

function formatAddress(addr?: Address | null) {
  if (!addr) return ''
  return [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
    .filter(Boolean)
    .join(', ')
}

export default function ProductSellerSidebar({
  productId: _productId,
  productName,
  seller,
  minOrderQuantity,
  onContact,
}: SellerSidebarProps) {
  const [quantity, setQuantity] = useState(minOrderQuantity || 1)
  const [message, setMessage] = useState(
    `Hi, I am interested in ${productName}. Please send me more details.`
  )

  const storeName = seller.shopName || seller.companyName
  const legalName = seller.businessRegisteredName || seller.companyName
  const address = formatAddress(seller.registeredAddress)

  return (
    <aside className="w-full lg:w-[320px] shrink-0 border border-gray-200 rounded-2xl p-5 bg-white shadow-sm h-fit">
      <h3 className="font-bold text-gray-900 text-lg leading-tight">{storeName}</h3>

      {seller.gstNumber && (
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-semibold">GST</span> — {seller.gstNumber}
        </p>
      )}

      {legalName !== storeName && (
        <p className="text-sm text-gray-700 mt-1 font-medium">{legalName}</p>
      )}

      {address && (
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">{address}</p>
      )}

      <div className="mt-5 flex items-center gap-2">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1">
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full px-3 py-2 text-sm outline-none"
          />
          <span className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-l">Pieces</span>
        </div>
        <Button
          type="button"
          onClick={() => onContact({ quantity })}
          className="bg-[#006d44] hover:bg-[#005a36] text-white shrink-0"
        >
          ADD
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-[#006d44] text-[#006d44] hover:bg-green-50 text-xs h-10"
          onClick={() => onContact({ quantity })}
        >
          View Number
        </Button>
        <Button
          type="button"
          className="bg-[#006d44] hover:bg-[#005a36] text-white text-xs h-10"
          onClick={() => onContact({ quantity })}
        >
          Get best Quotation
        </Button>
      </div>

      <div className="mt-5">
        <label className="text-sm font-semibold text-gray-800 block mb-2">
          Send a message
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px] text-sm resize-none"
        />
        <Button
          type="button"
          onClick={() => onContact({ quantity })}
          className="w-full mt-3 bg-[#006d44] hover:bg-[#005a36] text-white"
        >
          Send Inquiry
        </Button>
      </div>

      {seller.description && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <h4 className="font-bold text-gray-900 mb-2">Company Details</h4>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
            {seller.description}
          </p>
        </div>
      )}
    </aside>
  )
}
