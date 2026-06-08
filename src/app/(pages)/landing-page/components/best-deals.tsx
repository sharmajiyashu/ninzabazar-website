'use client'
import React, { useEffect } from 'react'
import DealsCard from '../../../components/deals-card'
import Link from 'next/link'
import { animate, motion, useMotionValue } from 'framer-motion'
import useMeasure from 'react-use-measure'

type LandingDeal = {
  id: string
  title: string
  description: string
  imageUrl: string
  bgColor: string
  linkUrl?: string | null
}

type ProductDealsProps = {
  title: string
  deals: LandingDeal[]
}

const ProductDeals = ({ title, deals }: ProductDealsProps) => {
  const [ref, { width }] = useMeasure()
  const xTranslation = useMotionValue(0)

  useEffect(() => {
    if (!width) return
    const finalPosition = (-width / 2) * 4.4
    const controls = animate(xTranslation, [0, finalPosition], {
      ease: 'linear',
      duration: 25,
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 0,
    })
    return controls.stop
  }, [width, xTranslation])

  if (deals.length === 0) return null

  return (
    <section className="w-full mx-auto font-sans border-t border-gray-100 pt-6 md:pt-8">
      <div className="mb-4 md:mb-6 flex items-center">
        <h2
          className="select-none text-[#181A20] text-xl sm:text-2xl md:text-[28px] font-semibold"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {title}
        </h2>
      </div>

      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {deals.map((item) => (
          <Link key={item.id} href={item.linkUrl || '/products'} className="w-full flex justify-center">
            <DealsCard
              title={item.title}
              description={item.description}
              image={item.imageUrl}
              altImage={item.title}
              bgColor={item.bgColor}
            />
          </Link>
        ))}
      </div>

      <div className="block md:hidden overflow-hidden w-full">
        <motion.div className="flex gap-4" style={{ x: xTranslation }}>
          <div className="flex gap-4" ref={ref}>
            {[...deals, ...deals].map((item, index) => (
              <Link key={`${item.id}-${index}`} href={item.linkUrl || '/products'} className="flex-shrink-0">
                <DealsCard
                  title={item.title}
                  description={item.description}
                  image={item.imageUrl}
                  altImage={item.title}
                  bgColor={item.bgColor}
                />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProductDeals
