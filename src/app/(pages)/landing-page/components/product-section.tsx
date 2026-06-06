'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { User, Phone, Clipboard } from 'lucide-react'

// Mock B2B Product Card Component
interface B2BProductCardProps {
  id: string
  name: string
  image: string
  priceRange: string
  moq: string
}

const B2BProductCard: React.FC<B2BProductCardProps> = ({ name, image, priceRange, moq }) => {
  return (
    <div className="flex flex-col bg-white border border-gray-150 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 relative group h-full justify-between">
      {/* Top right icon */}
      <div className="absolute top-3 right-3 text-[#006d44] opacity-80 bg-gray-50 p-1.5 rounded-lg border border-gray-100 group-hover:opacity-100 transition-opacity">
        <Clipboard size={14} />
      </div>

      {/* Image container */}
      <div className="flex items-center justify-center w-full aspect-square mb-4 bg-gray-50 rounded-xl overflow-hidden p-2">
        <Image
          src={image}
          alt={name}
          width={180}
          height={180}
          className="object-contain max-h-[140px] transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5 flex-1 justify-between">
        <div>
          <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-relaxed mb-1.5 select-none">
            {name}
          </h4>
          <p className="text-sm font-black text-[#006d44] leading-none mb-0.5">
            {priceRange}
          </p>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {moq}
          </p>
        </div>

        <button
          onClick={() => toast.success("Inquiry sent successfully to the supplier!")}
          className="w-full bg-[#006d44] hover:bg-[#005a36] text-white font-bold py-2 rounded-xl text-[11px] uppercase tracking-wider transition-colors duration-200 mt-3.5 cursor-pointer"
        >
          Send Inquiry
        </button>
      </div>
    </div>
  )
}

const ProductSection = () => {
  // Contact Form States
  const [formData, setFormData] = useState({ firstName: '', phoneNumber: '', query: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.phoneNumber || !formData.query) {
      toast.error('Please fill in all fields.')
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Thank you! Your query has been submitted.')
      setFormData({ firstName: '', phoneNumber: '', query: '' })
    }, 1500)
  }

  // B2B Products Data for grids
  const featuredProducts = [
    { id: 'f1', name: 'New model bonded popular wireless Bluetooth headphone with heavy bass', image: '/deals-mock4.png', priceRange: '$9.95 - $14.95', moq: 'Min. Order: 10 Pieces' },
    { id: 'f2', name: 'Wireless Bluetooth Earbuds sports waterproof smart charging case', image: '/placeholder.png', priceRange: '$3.95 - $6.95', moq: 'Min. Order: 100 Pieces' },
    { id: 'f3', name: 'Premium sound canceling over-ear gaming headphones with mic', image: '/deals-mock4.png', priceRange: '$12.95 - $18.95', moq: 'Min. Order: 50 Pieces' },
    { id: 'f4', name: 'Cute cat ear shape wireless Bluetooth headset with LED light', image: '/deals-mock4.png', priceRange: '$8.50 - $12.50', moq: 'Min. Order: 10 Pieces' },
  ]

  const fashionProducts = [
    { id: 'fa1', name: 'Men’s regular fit casual cotton polo t-shirt multipack options', image: '/img/polo_shirts.png', priceRange: '$4.95 - $8.95', moq: 'Min. Order: 50 Pieces' },
    { id: 'fa2', name: 'Unisex premium fleece hoodie street fashion sportswear jacket', image: '/img/polo_shirts.png', priceRange: '$9.50 - $14.50', moq: 'Min. Order: 20 Pieces' },
    { id: 'fa3', name: 'Vintage style designer leather jacket with custom zippers', image: '/img/polo_shirts.png', priceRange: '$22.00 - $35.00', moq: 'Min. Order: 10 Pieces' },
    { id: 'fa4', name: 'Casual summer short sleeve patterned beach wear shirt', image: '/img/polo_shirts.png', priceRange: '$3.50 - $6.50', moq: 'Min. Order: 100 Pieces' },
  ]

  const airCleaningProducts = [
    { id: 'ac1', name: 'HEPA smart air purifier tower with carbon filter for large room', image: '/placeholder.png', priceRange: '$45.00 - $65.00', moq: 'Min. Order: 5 Pieces' },
    { id: 'ac2', name: 'Portable air cleaner deodorizer USB charging desktop filter', image: '/placeholder.png', priceRange: '$12.00 - $18.00', moq: 'Min. Order: 20 Pieces' },
    { id: 'ac3', name: 'Industrial grade high capacity HVAC electrostatic air filter', image: '/placeholder.png', priceRange: '$85.00 - $120.00', moq: 'Min. Order: 2 Pieces' },
    { id: 'ac4', name: 'Wall mounted home intelligent humidifier and purifier unit', image: '/placeholder.png', priceRange: '$35.00 - $55.00', moq: 'Min. Order: 10 Pieces' },
  ]

  const sportsProducts = [
    { id: 'sp1', name: 'Premium non-slip speed jump rope with ball bearings handle', image: '/img/sports_equipment.png', priceRange: '$1.50 - $3.00', moq: 'Min. Order: 200 Pieces' },
    { id: 'sp2', name: 'Pro golf training accessory gift box alignment aids tees balls', image: '/img/sports_equipment.png', priceRange: '$15.00 - $25.00', moq: 'Min. Order: 10 Pieces' },
    { id: 'sp3', name: 'English willow lightweight cricket bat standard size professional', image: '/img/sports_equipment.png', priceRange: '$45.00 - $75.00', moq: 'Min. Order: 5 Pieces' },
    { id: 'sp4', name: 'Heavy duty composite wood baseball bat comfortable grip tape', image: '/img/sports_equipment.png', priceRange: '$8.00 - $12.00', moq: 'Min. Order: 30 Pieces' },
  ]

  const beautyProducts = [
    { id: 'be1', name: 'Professional smart gel nail curing lamp machine salon dryer', image: '/placeholder.png', priceRange: '$14.00 - $22.00', moq: 'Min. Order: 20 Pieces' },
    { id: 'be2', name: 'Facial hydrating serums set anti-aging pure vitamin essence', image: '/placeholder.png', priceRange: '$6.50 - $10.50', moq: 'Min. Order: 100 Pieces' },
    { id: 'be3', name: 'Matte velvet liquid lipstick cosmetics set long lasting colors', image: '/placeholder.png', priceRange: '$2.50 - $4.50', moq: 'Min. Order: 200 Pieces' },
    { id: 'be4', name: 'Aromatherapy organic pure essential oils gift kit for diffuser', image: '/placeholder.png', priceRange: '$8.00 - $12.00', moq: 'Min. Order: 50 Pieces' },
  ]

  return (
    <div className="flex flex-col gap-14 font-sans my-10 select-none">
      {/* 1. Trending Categories */}
      <div>
        <h2
          className="select-none text-[#181A20] mb-8"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '36px', lineHeight: '28px', letterSpacing: '0%' }}
        >
          Trending Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { name: 'Electronics', img: '/deals-mock4.png' },
            { name: 'Apparel & Fashion', img: '/img/polo_shirts.png' },
            { name: 'Accessories', img: '/img/handbag.png' },
            { name: 'Sports & Entertainment', img: '/img/sports_equipment.png' },
          ].map((cat, idx) => (
            <div key={idx} className="flex flex-col items-center gap-4 cursor-pointer group">
              <div className="w-40 h-40 rounded-full bg-[#d7f5e8] flex items-center justify-center border-2 border-transparent group-hover:border-[#006d44] transition-all duration-300 overflow-hidden shadow-sm relative p-4">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  width={110}
                  height={110}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="font-bold text-gray-700 text-sm group-hover:text-[#006d44] transition-colors">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Featured Products Grid */}
      <div>
        <h2
          className="select-none text-[#181A20] mb-6"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '36px', lineHeight: '28px', letterSpacing: '0%' }}
        >
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <B2BProductCard key={p.id} id={p.id} name={p.name} image={p.image} priceRange={p.priceRange} moq={p.moq} />
          ))}
        </div>
      </div>

      {/* 3. Apparel & Fashion Grid */}
      <div>
        <h2
          className="select-none text-[#181A20] mb-6"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '36px', lineHeight: '28px', letterSpacing: '0%' }}
        >
          Apparel & Fashion
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fashionProducts.map((p) => (
            <B2BProductCard key={p.id} id={p.id} name={p.name} image={p.image} priceRange={p.priceRange} moq={p.moq} />
          ))}
        </div>
      </div>

      {/* 4. Air Cleaning Equipment Grid */}
      <div>
        <h2
          className="select-none text-[#181A20] mb-6"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '36px', lineHeight: '28px', letterSpacing: '0%' }}
        >
          Air Cleaning Equipment
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {airCleaningProducts.map((p) => (
            <B2BProductCard key={p.id} id={p.id} name={p.name} image={p.image} priceRange={p.priceRange} moq={p.moq} />
          ))}
        </div>
      </div>

      {/* 5. Sports & Entertainment Grid */}
      <div>
        <h2
          className="select-none text-[#181A20] mb-6"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '36px', lineHeight: '28px', letterSpacing: '0%' }}
        >
          Sports & Entertainment
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sportsProducts.map((p) => (
            <B2BProductCard key={p.id} id={p.id} name={p.name} image={p.image} priceRange={p.priceRange} moq={p.moq} />
          ))}
        </div>
      </div>

      {/* 6. Beauty & Health Grid */}
      <div>
        <h2
          className="select-none text-[#181A20] mb-6"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '36px', lineHeight: '28px', letterSpacing: '0%' }}
        >
          Beauty & Health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {beautyProducts.map((p) => (
            <B2BProductCard key={p.id} id={p.id} name={p.name} image={p.image} priceRange={p.priceRange} moq={p.moq} />
          ))}
        </div>
      </div>

      {/* 7. Have a Question Form Section */}
      <div
        className="border border-[#b8e5d8] p-8 md:p-12 flex flex-col md:flex-row items-center mt-6 mx-auto w-full max-w-[1240px] md:h-[634px]"
        style={{
          boxSizing: 'border-box',
          background: 'linear-gradient(116.14deg, rgba(26, 115, 232, 0.1) 0.82%, rgba(15, 64, 130, 0) 66.46%)',
          borderRadius: '13px'
        }}
      >
        {/* Inner container wrapper (Group 1171278314) */}
        <div className="w-full max-w-[1108px] md:h-[527px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 mx-auto">

          {/* Left Side Illustration with outer circle ring and drop shadow (Group 17746) */}
          <div
            className="flex-shrink-0 relative w-64 h-64 md:w-[344.37px] md:h-[438px] flex items-center justify-center"
            style={{
              filter: 'drop-shadow(0px 100px 99px rgba(226, 226, 226, 0.8))'
            }}
          >
            {/* Outer circle border line */}
            <div className="absolute w-[240px] h-[240px] md:w-[300px] md:h-[300px] border border-[#cbe2fc] rounded-full pointer-events-none"></div>
            {/* Inner background circle */}
            <div className="w-52 h-52 md:w-[260px] md:h-[260px] rounded-full bg-gradient-to-tr from-[#cfe2fe] to-[#eff6ff] border-4 border-white shadow-md"></div>

            {/* Delivery Boy Image positioned absolutely relative to Group 17746 to allow cap to pop out */}
            <div
              className="absolute"
              style={{
                left: '9.15%',
                right: '11.2%',
                top: '-16.19%',
                bottom: '3.4%',
                width: '79.65%',
                height: '112.79%'
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


          {/* Right Side Form (Group 1171277344) */}
          <div className="w-full md:w-[556px] flex flex-col justify-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-2 leading-none">
              Have a Question?
            </h3>
            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
              If you&apos;re a buyer and have any queries, feel free to fill out the form. Our team will get back to you shortly.
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-4 w-full">
              {/* First Name */}
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

              {/* Phone Number */}
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

              {/* Query */}
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

              {/* Full-width submit button */}
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
    </div>
  )
}

export default ProductSection

