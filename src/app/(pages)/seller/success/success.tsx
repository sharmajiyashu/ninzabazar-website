import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useRouter } from 'next/navigation'

const App = () => {
  return (
    <DotLottieReact
      src="https://lottie.host/7cda3c7f-465f-4f40-b89b-ede093d6d317/W74udAYExs.lottie"
      autoplay
    />
  )
}

const Success = () => {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center px-4 text-center">
      <div className="w-md h-auto">
        <App />

        <h3 className="font-black text-green lg:text-xl xl:text-3xl  ">
          Registration Submitted
        </h3>

        <p className="text-center text-disabledgrey font-semibold">
          Please wait while we review your details. Expect an email within 2-3
          business days.
        </p>

        <div className="mt-4">
          <button
            onClick={() => {
              router.push('/seller/dashboard')
            }}
            className="px-4 py-2 bg-green hover:bg-green-800 text-white rounded-md w-3/6"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default Success
