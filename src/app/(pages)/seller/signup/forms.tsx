'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'
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
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

const formSchema = z
  .object({
    companyName: z.string().min(2, {
      message: 'Company Name must be at least 2 or more characters.',
    }),
    firstName: z.string().min(2, {
      message: 'First Name must be at least 2 or more characters.',
    }),
    lastName: z.string().min(2, {
      message: 'Last Name must be at least 2 or more characters.',
    }),
    email: z.string().email('Invalid email address.'),
    contactNumber: z
      .string()
      .min(10, { message: 'Enter a valid contact number.' }),
    password: z.string().min(6, {
      message: 'Password must be at least 8 or more characters.',
    }),
    confirmPassword: z.string().min(6, {
      message: 'Password must be at least 8 or more characters.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const SignupForms = () => {
  const router = useRouter()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setisConfirmPasswordVisible] =
    useState(false)
  const [isLoading, setIsLoading] = useState(false)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/auth/seller-signUp`, {
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
        router.push(`/seller/login`)
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
      companyName: '',
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
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 block mb-1">Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Ninja Corp" {...field} className="border border-gray-200 rounded-lg px-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-sm font-medium text-gray-700 block mb-1">First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane" {...field} className="border border-gray-200 rounded-lg px-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800" />
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
                    <Input placeholder="e.g. Smith" {...field} className="border border-gray-200 rounded-lg px-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800" />
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
                  <Input placeholder="e.g. jane@company.com" {...field} className="border border-gray-200 rounded-lg px-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800" />
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
                  <PhoneInput
                    {...field}
                    defaultCountry="IN"
                    international
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    className="phone-input rounded-lg border border-gray-200 bg-white px-4 py-2.5 h-11 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] w-full text-gray-800"
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
                      type={isPasswordVisible ? 'text' : 'password'}
                      placeholder="••••••••••••••••"
                      {...field}
                      className="border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800"
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 text-gray-400 hover:text-gray-700 focus:outline-none"
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                    >
                      {isPasswordVisible ? (
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
                      type={isConfirmPasswordVisible ? 'text' : 'password'}
                      placeholder="••••••••••••••••"
                      {...field}
                      className="border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 h-11 w-full focus-visible:ring-1 focus-visible:ring-[#006d44] focus-visible:border-[#006d44] text-sm text-gray-800"
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 text-gray-400 hover:text-gray-700 focus:outline-none"
                      onClick={() =>
                        setisConfirmPasswordVisible((prev) => !prev)
                      }
                    >
                      {isConfirmPasswordVisible ? (
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
            {isLoading ? 'CREATING ACCOUNT...' : 'CREATE SELLER ACCOUNT'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default SignupForms
