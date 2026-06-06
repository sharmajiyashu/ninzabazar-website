'use client'
import React from 'react'
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
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const formSchema = z
  .object({
    firstName: z.string().min(2, {
      message: 'First Name must be at least 2 characters.',
    }),
    lastName: z.string().min(2, {
      message: 'Last Name must be at least 2 characters.',
    }),
    email: z.string().email('Invalid email address.'),
    contactNumber: z.preprocess(
      (val) => (typeof val === 'string' ? Number(val) : val),
      z.number().min(1000000000, {
        message: 'Contact Number must be at least 10 digits.',
      })
    ),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters.',
    }),
    confirmPassword: z.string().min(6, {
      message: 'Password must be at least 6 characters.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const SignupForms = () => {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/auth/buyer-signUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      const data = await response.json()
      console.log(data)
      if (!response.ok) {
        toast.error(data.error)
        setIsLoading(false)
      }
      if (response.ok) {
        toast.success('Registration successful')
        router.push(`/login`)
      }
    } catch (error) {
      toast.error('Something went wrong!')
      console.log(error)
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: undefined,
      password: '',
      confirmPassword: '',
    },
  })

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-sm font-medium text-gray-700 block mb-1">First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John" {...field} className="border border-gray-200 rounded-lg px-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800" />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-sm font-medium text-gray-700 block mb-1">Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Doe" {...field} className="border border-gray-200 rounded-lg px-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800" />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 block mb-1">Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. john@example.com" {...field} className="border border-gray-200 rounded-lg px-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 block mb-1">Contact Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="9876543210"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const num = e.target.value ? Number(e.target.value) : ''
                      field.onChange(num)
                    }}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800"
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
                <FormLabel className="text-sm font-medium text-gray-700 block mb-1">Password</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••••••"
                      {...field}
                      className="border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800"
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••••••"
                      {...field}
                      className="border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800"
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
            className="w-full bg-[#006d44] hover:bg-[#005a36] text-white font-bold py-3 h-12 rounded-lg uppercase tracking-wider text-xs transition-all duration-300 mt-6 shadow-lg shadow-green-900/10 cursor-pointer"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default SignupForms
