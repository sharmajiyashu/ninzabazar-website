'use client'
import React, { useEffect } from 'react'
import DealsCard from '../../../components/deals-card'
import { DealsDataProps } from '@/app/types/type'
import Link from 'next/link'
import { animate, motion, useMotionValue } from 'framer-motion'
import useMeasure from 'react-use-measure'

const mockDeals = [
  {
    id: 1,
    title: 'Small Appliances',
    description: 'Up to 40% off kitchen products',
    image: '/deals-mock.png',
    altImage: 'Flash Sale Banner',
    bgColor: 'bg-[#0a8558]',
  },
  {
    id: 2,
    title: 'Premium Beauty',
    description: 'Flat 25% Off Hair Care',
    image: '/deals-mock2.png',
    altImage: 'Buy 1 Get 1 Free Offer',
    bgColor: 'bg-[#ff7a22]',
  },
  {
    id: 3,
    title: 'Indoor Furniture',
    description: 'Save up to 30% today',
    image: '/deals-mock3.png',
    altImage: 'Free Shipping Promotion',
    bgColor: 'bg-[#ffcd1f]',
  },
  {
    id: 4,
    title: 'Gadget & Device',
    description: 'Upto 15koff on Sablets',
    image: '/deals-mock4.png',
    altImage: 'Members-Only Discount',
    bgColor: 'bg-[#4c8cf5]',
  },
]

const ProductDeals = () => {
  const [ref, { width }] = useMeasure()

  const xTranslation = useMotionValue(0)

  useEffect(() => {
    const finalPosition = (-width / 2) * 4.4

    const controls = animate(xTranslation, [0, finalPosition], {
      ease: 'linear',
      duration: 25, // Reduced duration to make it faster
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 0,
    })

    return controls.stop
  }, [width, xTranslation])
  return (
    <div className="w-full max-w-[1241px] mx-auto my-10 font-sans">
      <div className="mb-6 flex items-center">
        <h2
          className="select-none text-[#181A20] text-2xl md:text-[28px] font-semibold"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Today&apos;s Best Deals
        </h2>
      </div>


      {/* Grid for larger screens */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
        {mockDeals.map((items: DealsDataProps) => (
          <Link key={items.id} href={'/'} className="w-full flex justify-center">
            <DealsCard
              title={items.title}
              description={items.description}
              image={items.image}
              altImage={items.altImage}
              bgColor={items.bgColor}
            />
          </Link>
        ))}
      </div>

      {/* Carousel for mobile */}
      <div className="block md:hidden overflow-hidden w-full">
        <motion.div className="flex gap-4" style={{ x: xTranslation }}>
          <div className="flex gap-4" ref={ref}>
            {[...mockDeals, ...mockDeals].map((items: DealsDataProps, index) => (
              <Link key={index} href={'/'} className="flex-shrink-0">
                <DealsCard
                  title={items.title}
                  description={items.description}
                  image={items.image}
                  altImage={items.altImage}
                  bgColor={items.bgColor}
                />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}


export default ProductDeals
