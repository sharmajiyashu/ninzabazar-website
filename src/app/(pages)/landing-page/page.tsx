import React from 'react'
import HeroBanner from './components/hero-banner'
import ProductDeals from './components/best-deals'
import ProductSection from './components/product-section'
import TrendingCategories from './components/trending-categories'

const LandingPage = () => {
  return (
    <div className="min-h-screen max-w-7xl mx-auto my-10 px-4 md:px-8">
      <HeroBanner />
      <TrendingCategories />
      <ProductDeals />
      <ProductSection />
    </div>
  )
}

export default LandingPage
