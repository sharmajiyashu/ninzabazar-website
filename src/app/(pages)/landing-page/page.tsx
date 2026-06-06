import React from 'react'
import HeroBanner from './components/hero-banner'
import ProductDeals from './components/best-deals'
import ProductSection from './components/product-section'

const LandingPage = () => {
  return (
    <div className="min-h-screen max-w-full my-10 lg:mx-0 md:px-12 lg:px-20 xl:mx-20">
      <HeroBanner />
      <ProductDeals />
      <ProductSection />
    </div>
  )
}

export default LandingPage
