'use client'
import React from 'react'
import Image from 'next/image'
import circlebg from '@/../public/circlebg.png'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const SubmitRegistration = () => {
  const router = useRouter()
  return (
    <div className="relative overflow-hidden">
      <div>
        <div className="absolute top-2/3 -left-64">
          <Image src={circlebg} alt="bg" width={500} height={500} />
        </div>
        <div className="absolute -top-48 -right-56">
          <Image src={circlebg} alt="bg" width={500} height={500} />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center text-center my-60">
        <div className="h-auto w-md">
          <DotLottieReact
            src="https://lottie.host/7cda3c7f-465f-4f40-b89b-ede093d6d317/W74udAYExs.lottie"
            autoplay
          />
        </div>
        <span className="my-4 text-lg font-black xl:text-3xl text-green">
          Registration Submitted
        </span>
        <p className="font-semibold text-center text-disabledgrey">
          Please wait while we review your details. Expect an
          <br />
          email within 2-3 business days.
        </p>
        <Button
          className="px-4 py-2 mt-4 text-white rounded-md bg-green hover:bg-green-800 w-sm"
          onClick={() => router.push('/')}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}

export default SubmitRegistration
