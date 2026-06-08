import React from 'react'
import { getLandingPageData } from '@/lib/landing-page'
import HeroBanner from './components/hero-banner'
import ProductDeals from './components/best-deals'
import ProductSection from './components/product-section'
import TrendingCategories from './components/trending-categories'

const LandingPage = async () => {
  const landing = await getLandingPageData()

  return (
    <div className="page-container !py-2 md:!py-4 animate-fade-up space-y-6 md:space-y-10">
      <HeroBanner
        topCategoriesTitle={landing.topCategoriesTitle}
        topCategories={landing.topCategories}
        allCategories={landing.allCategories}
        hero={landing.hero as Record<string, unknown> | null}
      />

      {landing.showBestDeals && landing.deals.length > 0 && (
        <ProductDeals title={landing.bestDealsTitle} deals={landing.deals} />
      )}

      {landing.showTrendingSection && landing.trendingCategories.length > 0 && (
        <TrendingCategories
          title={landing.trendingCategoriesTitle}
          subtitle={landing.trendingCategoriesSubtitle}
          categories={landing.trendingCategories}
        />
      )}

      <ProductSection
        productSections={landing.productSections}
        contactForm={landing.contactForm}
      />
    </div>
  )
}

export default LandingPage
