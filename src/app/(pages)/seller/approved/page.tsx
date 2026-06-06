'use client'
import React from 'react'
import BackgroundDesign from './background-design'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Button } from '@/components/ui/button'

const page = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-x-hidden overflow-y-hidden">
      <BackgroundDesign />

      {/* Main Content */}

      <div className="flex flex-col items-center justify-center px-4 text-center">
        <div className="w-md h-auto">
          <DotLottieReact
            src="https://lottie.host/7cda3c7f-465f-4f40-b89b-ede093d6d317/W74udAYExs.lottie"
            autoplay
          />

          <h3 className="font-black text-green lg:text-xl xl:text-3xl  ">
            Product sent for approval
          </h3>

          <p className="text-center text-disabledgrey font-semibold">
            Please wait while we process your items, thank you!
          </p>

          <div className="mt-4 flex gap-x-4">
            <Button className="px-4 py-2 bg-green hover:bg-green-800 text-white rounded-md w-3/6">
              Dashboard
            </Button>
            <Button className="px-4 py-2 border border-green bg-white hover:bg-green hover:text-white text-green rounded-md w-3/6">
              Post new product
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
