'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Phone } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

type ContactSellerModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  sellerId: string
  defaultQuantity?: number
  defaultColor?: string
  colors?: { id: string; name: string }[]
}

export default function ContactSellerModal({
  open,
  onOpenChange,
  productId,
  productName,
  sellerId,
  defaultQuantity = 1,
  defaultColor = '',
  colors = [],
}: ContactSellerModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [quantity, setQuantity] = useState(defaultQuantity)
  const [color, setColor] = useState(defaultColor)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setQuantity(defaultQuantity)
      setColor(defaultColor)
    }
  }, [open, defaultQuantity, defaultColor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const digits = phoneNumber.replace(/\D/g, '')
    if (digits.length < 10) {
      toast.error('Please enter a valid phone number.')
      return
    }
    if (quantity < 1) {
      toast.error('Quantity must be at least 1.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/customer-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'PRODUCT',
          phoneNumber: digits,
          productId,
          productName,
          sellerId,
          quantity,
          color: color || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit inquiry.')
        return
      }
      toast.success('Inquiry sent successfully to the supplier!')
      setPhoneNumber('')
      onOpenChange(false)
    } catch {
      toast.error('Failed to submit inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden gap-0 border-[#b8e5d8]">
        <DialogTitle className="sr-only">Contact Seller</DialogTitle>
        <div
          className="flex flex-col md:flex-row"
          style={{
            background:
              'linear-gradient(116.14deg, rgba(26, 115, 232, 0.1) 0.82%, rgba(15, 64, 130, 0) 66.46%)',
          }}
        >
          <div className="hidden md:flex flex-shrink-0 relative w-[280px] items-center justify-center p-6">
            <div className="absolute w-[220px] h-[220px] border border-[#cbe2fc] rounded-full pointer-events-none" />
            <div className="w-[200px] h-[200px] rounded-full bg-gradient-to-tr from-[#cfe2fe] to-[#eff6ff] border-4 border-white shadow-md" />
            <div className="absolute inset-x-6 top-4 bottom-4">
              <Image
                src="/img/question_boy.png"
                alt="Contact seller"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex-1 p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-6">
              Contact Seller and get details on your quickly
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden h-11">
                  <span className="px-3 text-sm font-semibold text-gray-600 border-r border-gray-200 bg-gray-50 h-full flex items-center">
                    +91
                  </span>
                  <div className="relative flex-1 flex items-center">
                    <Phone size={16} className="absolute left-3 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="enter mobile number"
                      className="w-full pl-9 pr-4 py-2 text-sm outline-none text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Quantity<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden h-11">
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="flex-1 px-4 text-sm outline-none text-gray-800"
                  />
                  <span className="px-3 text-xs text-gray-500 bg-gray-50 border-l h-full flex items-center">
                    Pieces
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Color</label>
                {colors.length > 0 ? (
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#006d44] focus:border-[#006d44] h-11"
                  >
                    <option value="">Select color</option>
                    {colors.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Enter preferred color"
                    className="w-full border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#006d44] focus:border-[#006d44] h-11 placeholder-gray-400"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#006d44] hover:bg-[#005a36] text-white font-bold py-3.5 rounded-lg text-sm transition-colors disabled:bg-gray-300 shadow-md mt-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
