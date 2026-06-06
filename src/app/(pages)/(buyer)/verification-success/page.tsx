'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, LoaderCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function VerificationSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, update, status } = useSession()
  const [countdown, setCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const hasUpdatedRef = useRef(false)
  const shouldRefresh = searchParams.get('refresh') === 'true'

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || !shouldRefresh) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, shouldRefresh])

  // Main redirect logic
  useEffect(() => {
    // Don't run if session is still loading
    if (status === 'loading') return

    // Only run once when component mounts and conditions are met
    if (shouldRefresh && session && !hasUpdatedRef.current) {
      hasUpdatedRef.current = true
      console.log('🔄 Starting session update...')
      setIsRedirecting(true)

      update({})
        .then(() => {
          console.log('✅ Session updated successfully')
          // Redirect to homepage after countdown completes
          setTimeout(() => {
            router.replace('/?verified=1')
          }, 3000) // 3 seconds to match countdown
        })
        .catch((error) => {
          console.error('❌ Error updating session:', error)
          // logout if session update fails
          toast.error('Failed to update session, please login again.')
          setTimeout(() => {
            signOut()
          }, 3000)
        })
    } else if (!shouldRefresh && !hasUpdatedRef.current) {
      // If accessed manually, redirect after short delay
      hasUpdatedRef.current = true
      setIsRedirecting(true)
      setTimeout(() => {
        router.replace('/')
      }, 1500)
    }
  }, [shouldRefresh, update, router, status, session])

  const handleContinue = () => {
    if (isRedirecting) return // Prevent navigation while updating/redirecting
    router.push('/')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-green-700 mb-4">
            Email Verified!
          </h1>

          <p className="mb-6 text-gray-600">
            Your email has been successfully verified. You can now access all
            features of the platform.
          </p>

          {shouldRefresh && countdown > 0 && (
            <div className="flex flex-col items-center justify-center gap-2">
              <LoaderCircle className="animate-spin w-10 h-10 text-green-600" />
              <p className="text-sm text-orange mb-4">
                Redirecting in {countdown} seconds...
              </p>
            </div>
          )}

          {isRedirecting && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <LoaderCircle className="animate-spin w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">
                Automatically redirecting to homepage...
              </p>
            </div>
          )}

          <Button
            onClick={handleContinue}
            disabled={isRedirecting}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50"
          >
            {isRedirecting ? 'Please wait...' : 'Continue to Homepage'}
          </Button>
        </div>
      </div>
    </div>
  )
}
