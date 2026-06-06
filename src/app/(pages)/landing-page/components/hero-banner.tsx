import React from 'react'
import Image from 'next/image'
import Categories from './sub-components/categories'

const HeroBanner = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 my-10 font-sans">
      {/* Categories sidebar */}
      <div className="hidden lg:block">
        <Categories />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Blue Banner */}
        <div className="bg-gradient-to-r from-[#2066d2] to-[#4b8df2] rounded-3xl w-full overflow-hidden shadow-lg transition-transform hover:shadow-xl duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center p-6 md:px-10 md:py-8 relative">
            {/* Banner Content */}
            <div className="text-center md:text-left mb-6 md:mb-0 max-w-md z-10">
              <h1 className="text-white font-extrabold text-2xl md:text-3xl lg:text-4xl leading-tight mb-3 select-none">
                Buy & Sell Products<br />Across India
              </h1>
              <p className="text-white/90 text-xs md:text-sm font-medium mb-5 leading-relaxed select-none">
                Connect with verified suppliers & distributors instantly.
              </p>
              <button className="bg-white text-[#2066d2] hover:bg-blue-50 font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-md cursor-pointer active:scale-95">
                Buy Product
              </button>
            </div>

            {/* Product Image */}
            <div className="w-full md:w-auto flex justify-center z-10">
              <div className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center">
                <Image
                  fill
                  src="/img/authentication/shopping_cart_3d.png"
                  alt="Ninja Bazaar Shopping Cart"
                  className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] animate-pulse [animation-duration:4s]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards (Request for Quotation, Sell, Grow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Request for Quotation */}
          <div className="bg-[#fce3f2] rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group h-32 md:h-36">
            <div className="flex-1 w-full relative flex items-center justify-center mb-2">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image
                  src="/img/hero-cards/quotation_3d.png"
                  alt="Request for Quotation"
                  fill
                  className="object-contain mix-blend-multiply group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300"
                />
              </div>
            </div>
            <h3 className="text-[#1e293b] font-bold text-xs md:text-sm lg:text-base text-center leading-snug select-none group-hover:text-pink-700 transition-colors">
              Request for Quotation
            </h3>
          </div>

          {/* Card 2: Sell Your Products */}
          <div className="bg-[#fdf0cd] rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group h-32 md:h-36">
            <div className="flex-1 w-full relative flex items-center justify-center mb-2">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image
                  src="/img/hero-cards/sell_products_3d.png"
                  alt="Sell Your Products"
                  fill
                  className="object-contain mix-blend-multiply group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
                />
              </div>
            </div>
            <h3 className="text-[#1e293b] font-bold text-xs md:text-sm lg:text-base text-center leading-snug select-none group-hover:text-amber-700 transition-colors">
              Sell Your Products
            </h3>
          </div>

          {/* Card 3: Grow Your Business */}
          <div className="bg-[#ffd3d5] rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group h-32 md:h-36">
            <div className="flex-1 w-full relative flex items-center justify-center mb-2">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image
                  src="/img/hero-cards/grow_business_3d.png"
                  alt="Grow Your Business"
                  fill
                  className="object-contain mix-blend-multiply group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300"
                />
              </div>
            </div>
            <h3 className="text-[#1e293b] font-bold text-xs md:text-sm lg:text-base text-center leading-snug select-none group-hover:text-rose-700 transition-colors">
              Grow Your Business
            </h3>
          </div>
        </div>

        {/* Mobile Categories sidebar */}
        <div className="block lg:hidden">
          <Categories />
        </div>
      </div>
    </div>
  )
}

export default HeroBanner

