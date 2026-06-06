'use client'
import React from 'react'
import Image from 'next/image'
import circlebg from '../../../../../public/circlebg.png'

import Success from './success'

const Page = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <div className="absolute top-2/3 -left-64">
        <Image src={circlebg} alt="bg" width={500} height={500} />
      </div>
      <div className="absolute -top-48  -right-56">
        <Image src={circlebg} alt="bg" width={500} height={500} />
      </div>

      {/* Main Content */}
      <div className="  ">
        <Success />
      </div>
    </div>
  )
}

export default Page
