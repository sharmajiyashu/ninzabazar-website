import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Button } from '@/components/ui/button'
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
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const storedOrderId = localStorage.getItem('orderId')
    if (storedOrderId) {
      setOrderId(storedOrderId)
      localStorage.removeItem('orderId') // Clear the orderId after use
    }
  }, [])
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center px-4 text-center">
      <div>
        <div className="w-md h-auto mx-auto ">
          <App />
        </div>
        <h3 className="font-black text-green lg:text-xl xl:text-3xl">
          Order Confirmed!
        </h3>
        <div className="text-disabledgrey space-y-2 mt-2 font-semibold">
          <p>
            Your order has been placed successfully. Thank you for choosing
            Ninja Bazaar.
          </p>
          <p className="">Order ID: {orderId}</p>
          <p>You can check your tracking link once the order is shipped.</p>
        </div>
        <div className="mt-4 space-y-4">
          <Link
            href="/orders"
            className="text-green font-semibold block text-medium"
          >
            View My Orders
          </Link>
          <Button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-green hover:bg-green-800 text-white rounded-md w-3/6"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Success
