'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerificationFailedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const getErrorMessage = () => {
    switch (error) {
      case 'missing_params':
        return 'Verification link is incomplete or invalid.'
      case 'invalid_token':
        return 'The verification token is invalid.'
      case 'token_expired':
        return 'The verification token has expired.'
      case 'user_not_found':
        return 'User account not found.'
      default:
        return 'An error occurred during email verification.'
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-red-700 mb-4">Verification Failed</h1>
          
          <p className="mb-6 text-gray-600">
            {getErrorMessage()}
          </p>
          
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => router.push('/verify-email')}
              className="w-full bg-green-700 hover:bg-green-800"
            >
              Try Again
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}