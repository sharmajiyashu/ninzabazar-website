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
          <div className="flex flex-col md:flex-row justify-between items-center p-8 md:p-12 relative">
            {/* Banner Content */}
            <div className="text-center md:text-left mb-8 md:mb-0 max-w-md z-10">
              <h1 className="text-white font-extrabold text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 select-none">
                Buy & Sell Products<br />Across India
              </h1>
              <p className="text-white/90 text-sm md:text-base font-medium mb-6 leading-relaxed select-none">
                Connect with verified suppliers & distributors instantly.
              </p>
              <button className="bg-white text-[#2066d2] hover:bg-blue-50 font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-300 shadow-md cursor-pointer active:scale-95">
                Buy Product
              </button>
            </div>

            {/* Product Image */}
            <div className="w-full md:w-auto flex justify-center z-10">
              <div className="relative w-[280px] md:w-[350px] aspect-square flex items-center justify-center">
                <Image
                  width={380}
                  height={380}
                  src="/img/authentication/shopping_cart_3d.png"
                  alt="Ninja Bazaar Shopping Cart"
                  className="h-auto max-w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] animate-pulse [animation-duration:4s]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards (Request for Quotation, Sell, Grow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Request for Quotation */}
          <div className="bg-[#fce3f2] rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-[#fbd0eb] group">
            <div className="flex-1">
              <h3 className="text-[#1e293b] font-bold text-lg leading-snug select-none group-hover:text-pink-600 transition-colors">
                Request for Quotation
              </h3>
            </div>
            <div className="w-16 h-16 flex items-center justify-center bg-white/60 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              {/* Pink Receipt SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" className="text-pink-500 fill-current">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm-4 8H7v-2h6v2z"/>
              </svg>
            </div>
          </div>

          {/* Card 2: Sell Your Products */}
          <div className="bg-[#fdf0cd] rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-[#fce6aa] group">
            <div className="flex-1">
              <h3 className="text-[#1e293b] font-bold text-lg leading-snug select-none group-hover:text-amber-600 transition-colors">
                Sell Your Products
              </h3>
            </div>
            <div className="w-16 h-16 flex items-center justify-center bg-white/60 rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              {/* Gold Store SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" className="text-amber-500 fill-current">
                <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2c0 .55.45 1 1 1h1v6h10v-6h4v6h2v-6h1c.55 0 1-.45 1-1zM6 18v-4h6v4H6z"/>
              </svg>
            </div>
          </div>

          {/* Card 3: Grow Your Business */}
          <div className="bg-[#ffd3d5] rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-[#fcc0c3] group">
            <div className="flex-1">
              <h3 className="text-[#1e293b] font-bold text-lg leading-snug select-none group-hover:text-rose-600 transition-colors">
                Grow Your Business
              </h3>
            </div>
            <div className="w-16 h-16 flex items-center justify-center bg-white/60 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              {/* Red Rocket SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" className="text-rose-500 fill-current">
                <path d="M12 2c-1.1 0-2 .9-2 2v6.17C7.61 10.74 6 13.01 6 16c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.99-1.61-5.26-4-5.83V4c0-1.1-.9-2-2-2zm0 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
            </div>
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

