'use client'
import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

const formSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
})

const LoginForms = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'mobile'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')

  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const response = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      role: 'SELLER',
      callbackUrl: ROUTES.seller.dashboard,
    })

    if (!response?.ok) {
      toast.error(response?.error ?? 'Incorrect username or password', {
        className: 'm-6',
      })
      setIsLoading(false)
      return
    }

    toast.success('Login successful!', { className: 'm-6' })
    router.push(ROUTES.seller.dashboard)
    router.refresh()
    setIsLoading(false)
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid 10-digit phone number.')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setOtpSent(true)
      toast.success(`OTP sent successfully to +91 ${phoneNumber}!`)
    }, 1500)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.length < 4) {
      toast.error('Please enter a valid OTP code.')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Logged in successfully via OTP!')
      router.push(ROUTES.seller.dashboard)
    }, 1500)
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex bg-white border border-gray-200 p-1.5 rounded-xl w-full mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
            activeTab === 'email'
              ? 'bg-[#006d44] text-white shadow-sm'
              : 'text-[#006d44] hover:bg-gray-50'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mobile')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
            activeTab === 'mobile'
              ? 'bg-[#006d44] text-white shadow-sm'
              : 'text-[#006d44] hover:bg-gray-50'
          }`}
        >
          Mobile Number
        </button>
      </div>

      {activeTab === 'email' ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 block mb-1">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seller@mail.com"
                      className="border border-gray-200 rounded-lg px-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 block mb-1">
                    Enter Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 text-[#006d44] w-4 h-4 pointer-events-none" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••••••"
                        className="border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 text-gray-400 hover:text-gray-700 focus:outline-none"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full bg-[#006d44] hover:bg-[#005a36] text-white font-bold py-3 h-12 rounded-lg uppercase tracking-wider text-xs transition-all duration-300 mt-2 shadow-lg shadow-green-900/10 cursor-pointer"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'SIGN IN'}
            </Button>
          </form>
        </Form>
      ) : (
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              {otpSent ? 'Enter Verification Code' : 'Phone Number'}
            </label>
            {!otpSent ? (
              <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-[#006d44] focus-within:border-[#006d44] text-sm h-11">
                <div className="bg-gray-50 px-4 border-r border-gray-200 text-gray-600 font-semibold select-none flex items-center">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="px-4 w-full focus:outline-none text-gray-800 font-medium"
                  placeholder="9876543210"
                />
              </div>
            ) : (
              <div className="relative flex items-center">
                <ShieldCheck className="absolute left-3.5 text-[#006d44] w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 h-11 w-full focus:outline-none focus:ring-1 focus:ring-[#006d44] focus:border-[#006d44] text-sm text-gray-800 tracking-widest font-semibold"
                  placeholder="Enter 6-digit OTP"
                />
              </div>
            )}
          </div>

          <Button
            className="w-full bg-[#006d44] hover:bg-[#005a36] text-white font-bold py-3 h-12 rounded-lg uppercase tracking-wider text-xs transition-all duration-300 mt-2 shadow-lg shadow-green-900/10 cursor-pointer"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? otpSent
                ? 'Verifying...'
                : 'Sending OTP...'
              : otpSent
              ? 'Verify OTP'
              : 'SEND OTP'}
          </Button>

          {otpSent && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-xs text-[#006d44] font-semibold hover:underline"
              >
                Change Phone Number
              </button>
            </div>
          )}
        </form>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mt-6 mb-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            defaultChecked
            className="accent-[#006d44] rounded border-gray-300 w-4 h-4 cursor-pointer"
          />
          <span className="font-semibold text-gray-700">Keep me signed in</span>
        </label>
        <Link href={ROUTES.seller.login} className="text-[#006d44] font-semibold hover:underline">
          Forgot password?
        </Link>
      </div>

    </div>
  )
}

export default LoginForms
