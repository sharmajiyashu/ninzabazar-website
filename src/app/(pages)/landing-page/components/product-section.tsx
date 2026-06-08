'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { User, Phone } from 'lucide-react'
import ProductListCartIcon from '@/app/components/product-list-cart-icon'

type LandingProduct = {
  id: string
  name: string
  image: string
  priceRange: string
  isSale?: boolean
  salePrice?: number | null
  basePrice?: number
  minOrderQuantity?: number | null
}

type ProductSectionData = {
  key: string
  title: string
  subtitle?: string | null
  products: LandingProduct[]
}

type ContactFormData = {
  title: string
  subtitle: string
  isVisible: boolean
}

type ProductSectionProps = {
  productSections: ProductSectionData[]
  contactForm: ContactFormData
}

const B2BProductCard: React.FC<LandingProduct> = ({
  id,
  name,
  image,
  priceRange,
  isSale,
  salePrice,
  basePrice,
  minOrderQuantity,
}) => {
  const displayPrice = isSale && salePrice ? salePrice : basePrice
  const formatInr = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <Link href={`/product/${id}`} className="block h-full">
      <div className="flex flex-col bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 relative group h-full">
        <div className="absolute top-3 right-3 z-10 transition-opacity opacity-90 group-hover:opacity-100">
          <ProductListCartIcon />
        </div>

        <div className="flex items-center justify-center w-full aspect-square mb-3 bg-gray-50 rounded-xl overflow-hidden p-3">
          <Image
            src={image}
            alt={name}
            width={180}
            height={180}
            className="object-contain max-h-[140px] w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col flex-1">
          <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-relaxed mb-2 min-h-[2.5rem]">
            {name}
          </h4>

          <div className="mb-1">
            {displayPrice != null && (
              <p className="text-sm font-bold text-[#2066d2] leading-none">
                {formatInr(displayPrice)}
              </p>
            )}
            {isSale && basePrice && salePrice && basePrice > salePrice && (
              <p className="text-xs text-gray-400 line-through mt-0.5">{formatInr(basePrice)}</p>
            )}
            {!isSale && priceRange && displayPrice == null && (
              <p className="text-sm font-bold text-[#2066d2]">{priceRange}</p>
            )}
          </div>

          {minOrderQuantity != null && minOrderQuantity > 0 && (
            <p className="text-[11px] text-gray-500 mb-3">Min. Order: {minOrderQuantity} Pieces</p>
          )}

          <span className="mt-auto w-full bg-[#006d44] group-hover:bg-[#005a36] text-white font-bold py-2.5 rounded-xl text-[11px] uppercase tracking-wide transition-colors text-center block">
            Send Inquiry
          </span>
        </div>
      </div>
    </Link>
  )
}

const ProductSection = ({ productSections, contactForm }: ProductSectionProps) => {
  const [formData, setFormData] = useState({ firstName: '', phoneNumber: '', query: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.phoneNumber || !formData.query) {
      toast.error('Please fill in all fields.')
      return
    }
    if (formData.phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/customer-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit query.')
        return
      }
      toast.success('Thank you! Your query has been submitted.')
      setFormData({ firstName: '', phoneNumber: '', query: '' })
    } catch {
      toast.error('Failed to submit query. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 md:gap-10 font-sans select-none">
      {productSections.map((section) =>
        section.products.length > 0 ? (
          <section key={section.key} className="border-t border-gray-100 pt-6 md:pt-8 first:border-t-0 first:pt-0">
            <h2
              className="select-none text-[#181A20] mb-4 md:mb-6 text-xl sm:text-2xl md:text-[28px] font-semibold"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-gray-500 mb-4 -mt-2 md:-mt-4 text-sm">{section.subtitle}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {section.products.map((p) => (
                <B2BProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        ) : null
      )}

      {contactForm.isVisible && (
        <div
          className="border border-[#b8e5d8] p-5 md:p-8 flex flex-col md:flex-row items-center mt-4 mx-auto w-full md:h-[634px]"
          style={{
            boxSizing: 'border-box',
            background: 'linear-gradient(116.14deg, rgba(26, 115, 232, 0.1) 0.82%, rgba(15, 64, 130, 0) 66.46%)',
            borderRadius: '13px',
          }}
        >
          <div className="w-full max-w-[1108px] md:h-[527px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 mx-auto">
            <div
              className="flex-shrink-0 relative w-64 h-64 md:w-[344.37px] md:h-[438px] flex items-center justify-center"
              style={{ filter: 'drop-shadow(0px 100px 99px rgba(226, 226, 226, 0.8))' }}
            >
              <div className="absolute w-[240px] h-[240px] md:w-[300px] md:h-[300px] border border-[#cbe2fc] rounded-full pointer-events-none"></div>
              <div className="w-52 h-52 md:w-[260px] md:h-[260px] rounded-full bg-gradient-to-tr from-[#cfe2fe] to-[#eff6ff] border-4 border-white shadow-md"></div>
              <div
                className="absolute"
                style={{
                  left: '9.15%',
                  right: '11.2%',
                  top: '-16.19%',
                  bottom: '3.4%',
                  width: '79.65%',
                  height: '112.79%',
                }}
              >
                <Image
                  src="/img/question_boy.png"
                  alt="Have a Question Courier"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            <div className="w-full md:w-[556px] flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-2 leading-none">
                {contactForm.title}
              </h3>
              {contactForm.subtitle && (
                <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
                  {contactForm.subtitle}
                </p>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4 w-full">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    First Name<span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User size={16} className="absolute left-3.5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="enter name"
                      className="w-full border border-gray-200 bg-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#006d44] focus:border-[#006d44] text-gray-800 placeholder-gray-400 h-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Phone Number<span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Phone size={16} className="absolute left-3.5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                      placeholder="enter mobile number"
                      className="w-full border border-gray-200 bg-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#006d44] focus:border-[#006d44] text-gray-800 placeholder-gray-400 h-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Query<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    placeholder="Write your query...."
                    className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#006d44] focus:border-[#006d44] text-gray-800 placeholder-gray-400 h-20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#006d44] hover:bg-[#005a36] text-white font-bold py-3.5 rounded-lg text-sm transition-all duration-300 disabled:bg-gray-300 shadow-md cursor-pointer text-center"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductSection
