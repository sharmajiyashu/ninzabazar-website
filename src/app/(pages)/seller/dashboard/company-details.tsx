'use client'
import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import axios from 'axios'
import { UserProps } from '@/app/types/type'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

const formSchema = z.object({
  businessRegisteredName: z.string().min(2),
  company_name: z.string().min(2),
  individual_registered_name: z.string(),
  shop_description: z.string(),
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(2),
  country: z.string().min(2),
  business_category: z.string(),
  date: z.date(),
})

type FormBasicDetails = {
  businessRegisteredName: string
  company_name: string
  business_type: string
  individual_registered_name: string
  shop_description: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  business_category: string
  date?: Date
}

const CompanyDetails = () => {
  // Hooks
  const { data: session } = useSession()

  // State Management
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessRegisteredName: '',
      company_name: '',
      individual_registered_name: '',
      shop_description: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      business_category: '',
      date: new Date(),
    },
  })

  // Data fetching
  const { data: user, refetch: refetchUser } = useQuery<UserProps>({
    queryKey: ['user', session?.user.id],
    queryFn: async () => {
      const res = await axios.get(`/api/getUser?id=${session?.user.id}`)
      console.log(res.data)
      return res.data
    },
  })

  // Combine address fields
  const getAddressString = () => {
    if (!user?.sellerProfile?.registeredAddress) return ''

    // If it's an array, take the first address
    const addresses = Array.isArray(user.sellerProfile.registeredAddress)
      ? user.sellerProfile.registeredAddress[0]
      : user.sellerProfile.registeredAddress

    if (!addresses) return ''

    return `${addresses.street}, ${addresses.city} ${addresses.state} ${addresses.postalCode} ${addresses.country}`
  }

  // Populate placeholders if seller exists
  useEffect(() => {
    if (user?.sellerProfile) {
      const sellerInfo = user.sellerProfile

      // Handle registered address safely - it could be null, undefined, or an array
      let addressData = {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      }

      if (sellerInfo.registeredAddress) {
        // If it's an array, take the first address
        const address = Array.isArray(sellerInfo.registeredAddress)
          ? sellerInfo.registeredAddress[0]
          : sellerInfo.registeredAddress

        if (address) {
          addressData = {
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            postalCode: address.postalCode || '',
            country: address.country || '',
          }
        }
      }

      form.reset({
        businessRegisteredName: sellerInfo.businessRegisteredName || '',
        company_name: sellerInfo.companyName || '',
        individual_registered_name: sellerInfo.individualRegisteredName || '',
        shop_description: sellerInfo.description || '',
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country,
        business_category: sellerInfo.businessType || '',
        date: sellerInfo.createdAt
          ? new Date(sellerInfo.createdAt)
          : new Date(),
      })
    }
  }, [user, form])

  // Format date
  const formatDate = (rawDate: string | undefined | null) => {
    if (!rawDate) return 'Invalid date'

    const date = new Date(rawDate)

    // Check if it's a valid date
    if (isNaN(date.getTime())) return 'Invalid date'

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const changedValues = (currentValues: z.infer<typeof formSchema>) => {
    if (!user?.sellerProfile) {
      console.warn('No seller profile found')
      return {}
    }

    const originalValues = {
      businessRegisteredName: user.sellerProfile.businessRegisteredName || '',
      company_name: user.sellerProfile.companyName || '',
      individual_registered_name:
        user.sellerProfile.individualRegisteredName || '',
      shop_description: user.sellerProfile.description || '',
      street: user.sellerProfile.registeredAddress?.street || '',
      city: user.sellerProfile.registeredAddress?.city || '',
      state: user.sellerProfile.registeredAddress?.state || '',
      postalCode: user.sellerProfile.registeredAddress?.postalCode || '',
      country: user.sellerProfile.registeredAddress?.country || '',
      business_category: user.sellerProfile.businessType || '',
    }

    const changedValues: Partial<FormBasicDetails> = {}

    // Compare each field and only include changed ones
    if (
      currentValues.businessRegisteredName.trim() !==
      originalValues.businessRegisteredName.trim()
    ) {
      changedValues.businessRegisteredName =
        currentValues.businessRegisteredName.trim()
    }

    if (
      currentValues.company_name.trim() !== originalValues.company_name.trim()
    ) {
      changedValues.company_name = currentValues.company_name.trim()
    }

    if (
      currentValues.individual_registered_name.trim() !==
      originalValues.individual_registered_name.trim()
    ) {
      changedValues.individual_registered_name =
        currentValues.individual_registered_name.trim()
    }

    if (
      currentValues.shop_description.trim() !==
      originalValues.shop_description.trim()
    ) {
      changedValues.shop_description = currentValues.shop_description.trim()
    }

    if (
      currentValues.business_category.trim() !==
      originalValues.business_category.trim()
    ) {
      changedValues.business_category = currentValues.business_category.trim()
    }

    // Check individual address fields
    if (currentValues.street.trim() !== originalValues.street.trim()) {
      changedValues.street = currentValues.street.trim()
    }

    if (currentValues.city.trim() !== originalValues.city.trim()) {
      changedValues.city = currentValues.city.trim()
    }

    if (currentValues.state.trim() !== originalValues.state.trim()) {
      changedValues.state = currentValues.state.trim()
    }

    if (currentValues.postalCode.trim() !== originalValues.postalCode.trim()) {
      changedValues.postalCode = currentValues.postalCode.trim()
    }

    if (currentValues.country.trim() !== originalValues.country.trim()) {
      changedValues.country = currentValues.country.trim()
    }

    console.log('Original values:', originalValues)
    console.log('Current values:', currentValues)
    console.log('Changed values to be sent:', changedValues)
    return changedValues
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const updateDetails = await axios.patch(
        `/api/seller-dashboard/basic-details/patch`,
        {
          id: user?.sellerProfile?.id,
          ...changedValues(values),
        }
      )
      console.log('Update successful:', updateDetails.data)
      setIsEditing(false)
      refetchUser()
      return updateDetails.data
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      setIsEditing(false)
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user?.sellerProfile) {
      const sellerInfo = user.sellerProfile

      // Handle registered address safely - it could be null, undefined, or an array
      let addressData = {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      }

      if (sellerInfo.registeredAddress) {
        // If it's an array, take the first address
        const address = Array.isArray(sellerInfo.registeredAddress)
          ? sellerInfo.registeredAddress[0]
          : sellerInfo.registeredAddress

        if (address) {
          addressData = {
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            postalCode: address.postalCode || '',
            country: address.country || '',
          }
        }
      }

      form.reset({
        businessRegisteredName: sellerInfo.businessRegisteredName || '',
        company_name: sellerInfo.companyName || '',
        individual_registered_name: sellerInfo.individualRegisteredName || '',
        shop_description: sellerInfo.description || '',
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country,
        business_category: sellerInfo.businessType || '',
        date: sellerInfo.createdAt
          ? new Date(sellerInfo.createdAt)
          : new Date(),
      })
    }
  }

  return (
    <div className="p-4">
      <Form {...form} key={user?.sellerProfile?.id}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          key={user?.sellerProfile?.id}
          className="space-y-4"
        >
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Left Column */}
            <div className="w-full space-y-4 md:w-1/2">
              {user?.sellerProfile?.companyName ? (
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!isEditing}
                          placeholder={user?.sellerProfile?.companyName}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="businessRegisteredName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Registered Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!isEditing}
                          placeholder={user?.sellerProfile?.companyName}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="individual_registered_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Individual Registered Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing}
                        placeholder={
                          user?.sellerProfile?.individualRegisteredName
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shop_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Description</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing}
                        placeholder={user?.sellerProfile?.description || ''}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Column */}
            <div className="w-full space-y-4 md:w-1/2">
              {!isEditing ? (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder={getAddressString() || undefined}
                    />
                  </FormControl>
                </FormItem>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <div>
                            <span className="text-sm font-medium">Street</span>
                            <Input
                              disabled={!isEditing}
                              placeholder={
                                user?.sellerProfile?.registeredAddress
                                  ?.street || undefined
                              }
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel></FormLabel>
                        <FormControl>
                          <div>
                            <span className="text-sm font-medium">City</span>
                            <Input
                              disabled={!isEditing}
                              placeholder={
                                user?.sellerProfile?.registeredAddress?.city ||
                                undefined
                              }
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel></FormLabel>
                        <FormControl>
                          <div>
                            <span className="text-sm font-medium">State</span>
                            <Input
                              disabled={!isEditing}
                              placeholder={
                                user?.sellerProfile?.registeredAddress?.state ||
                                undefined
                              }
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel></FormLabel>
                        <FormControl>
                          <div>
                            <span className="text-sm font-medium">
                              Postal Code
                            </span>
                            <Input
                              disabled={!isEditing}
                              placeholder={
                                user?.sellerProfile?.registeredAddress
                                  ?.postalCode || undefined
                              }
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel></FormLabel>
                        <FormControl>
                          <div>
                            <span className="text-sm font-medium">Country</span>
                            <Input
                              disabled={!isEditing}
                              placeholder={
                                user?.sellerProfile?.registeredAddress
                                  ?.country || undefined
                              }
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="business_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Category</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing}
                        placeholder={user?.sellerProfile?.businessType}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Account Created</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    placeholder={formatDate(
                      user?.sellerProfile?.createdAt || ''
                    )}
                  />
                </FormControl>
              </FormItem>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-green text-white hover:border hover:border-green hover:bg-white hover:text-green"
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green text-white hover:border hover:border-green hover:bg-white hover:text-green"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}

export default CompanyDetails
