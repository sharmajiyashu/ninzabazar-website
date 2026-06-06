'use client'
import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AccountForms from './account-forms'
import { Button } from '@/components/ui/button'
import AccountAddress from './account-address'
import { BuyerAccountPageProps, AddressFormData } from '@/app/types/type'
import AddressFormModal from './address-form-modal'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

function AccountTabs(props: BuyerAccountPageProps) {
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false)
  const [hasDefaultAddress, setHasDefaultAddress] = useState(false)
  const queryClient = useQueryClient()

  // Fetch user data including addresses
  const { data: userData, isLoading } = useQuery({
    queryKey: ['buyer-profile'],
    queryFn: async () => {
      const response = await fetch('/api/auth/buyer-profile/GET')
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }
      return response.json()
    },
  })

  // Handler for adding a new address
  const handleAddAddress = async (formData: AddressFormData) => {
    try {
      const response = await fetch('/api/auth/buyer-profile/POST', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: formData }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add address')
      }

      // Invalidate and refetch the user data to get updated addresses
      queryClient.invalidateQueries({ queryKey: ['buyer-profile'] })

      toast.success('Address added successfully')
      setIsAddAddressModalOpen(false)
      return result
    } catch (error) {
      console.error('Error adding address:', error)
      toast.error('Failed to add address')
      throw error
    }
  }

  // Function to refresh addresses when changes are made
  const refreshAddressList = () => {
    queryClient.invalidateQueries({ queryKey: ['buyer-profile'] })
  }

  // Effect to check for default addresses whenever userData changes
  useEffect(() => {
    if (userData?.addresses) {
      const defaultAddress = userData.addresses.find(
        (addr: { isDefault: boolean }) => addr.isDefault
      )
      setHasDefaultAddress(!!defaultAddress)
    }
  }, [userData])

  // Prepare props for child components
  const accountProps = {
    ...props,
    addresses: userData?.addresses || [],
    name: userData?.firstName
      ? `${userData.firstName} ${userData.lastName}`
      : props.name,
    email: userData?.email || props.email,
    phoneNumber: userData?.contactNumber || props.phoneNumber,
    dateOfBirth: userData?.dateOfBirth || props.dateOfBirth,
  }

  return (
    <div className="justify-center">
      <Tabs defaultValue="account">
        <TabsList className="w-auto py-4 px-auto sm:py-8 rounded-2xl">
          <TabsTrigger
            value="account"
            className="px-4 py-3 mx-2 text-sm sm:py-5 sm:mx-20 sm:text-lg"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="addresses"
            className="px-4 py-3 mx-2 text-sm sm:py-5 sm:mx-20 sm:text-lg"
          >
            Addresses
          </TabsTrigger>
        </TabsList>
        <div className="px-4 pt-4 my-2 border-2 rounded-xl sm:px-6 sm:pt-6">
          <TabsContent value="account">
            <div>
              <p className="mb-2 text-lg font-semibold sm:text-xl">
                My profile
              </p>
              <hr className="mb-4 text-black border-t-2" />
              <AccountForms {...accountProps} />
            </div>
          </TabsContent>

          <TabsContent value="addresses">
            <span className="flex flex-col mb-2 text-lg font-semibold sm:flex-row sm:items-center sm:justify-between sm:text-xl">
              My addresses
              <Button
                onClick={() => setIsAddAddressModalOpen(true)}
                className="px-4 py-3 mt-2 text-sm border sm:mt-0 sm:py-5 sm:px-7 sm:text-xl bg-green hover:bg-transparent border-green hover:border-green hover:text-green"
              >
                Add new address
              </Button>
            </span>
            <hr className="mb-4 text-black border-t-2" />
            {isLoading ? (
              <p>Loading addresses...</p>
            ) : (
              <AccountAddress
                {...accountProps}
                onAddressChange={refreshAddressList}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Add Address Modal */}
      <AddressFormModal
        isOpen={isAddAddressModalOpen}
        onClose={() => setIsAddAddressModalOpen(false)}
        onSubmit={handleAddAddress}
        title="Add New Address"
        hasDefaultAddress={hasDefaultAddress}
      />
    </div>
  )
}

export default AccountTabs
