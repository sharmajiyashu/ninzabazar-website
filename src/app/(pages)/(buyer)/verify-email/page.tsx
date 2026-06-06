'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function VerifyEmailPage() {
  const { data: session } = useSession()
  const [sending, setSending] = useState(false)
  const router = useRouter()

  const resendVerificationEmail = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session?.user?.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email')
      }

      toast.success('Verification email sent! Please check your inbox.')
    } catch (error) {
      console.error('Error resending verification email:', error)
      toast.error(
        'Failed to resend verification email. Please try again later.'
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-700 mb-4">
            Verify Your Email
          </h1>
          <div className="p-4 bg-yellow-50 rounded-lg mb-6">
            <p className="text-amber-800">
              Please verify your email address before continuing. We&apos;ve
              sent a verification link to:
            </p>
            <p className="font-semibold mt-2 text-black">
              {session?.user?.email}
            </p>
          </div>

          <p className="mb-6 text-gray-600">
            Check your inbox and click on the verification link we sent to
            activate your account.
          </p>

          <div className="flex flex-col gap-4">
            <Button
              onClick={resendVerificationEmail}
              disabled={sending}
              className="w-full bg-green-700 hover:bg-green-800"
            >
              {sending ? 'Sending...' : 'Resend Verification Email'}
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
