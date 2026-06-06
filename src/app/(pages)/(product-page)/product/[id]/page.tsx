import React from 'react'
import DetailsSection from '../../components/details-section'
import SellerCard from '../../components/seller-card-section'
import DescriptionTab from '../../components/description-section'
import RelatedProducts from '../../components/related-products-section'

const ProductPage = () => {
  return (
    <div className="mx-auto md:mx-40">
      <DetailsSection />
      <SellerCard />
      <DescriptionTab />
      <RelatedProducts />
    </div>
  )
}

export default ProductPage
