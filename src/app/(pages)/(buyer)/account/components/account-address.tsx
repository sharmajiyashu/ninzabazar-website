'use client'
import React, { useState } from 'react'
import {
  BuyerAccountPageProps,
  AddressFormData,
  ExtendedAddress,
} from '@/app/types/type'
import AddressFormModal from './address-form-modal'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AccountAddressProps extends BuyerAccountPageProps {
  onAddressChange?: () => void
}

const AccountAddress: React.FC<AccountAddressProps> = ({
  addresses = [],
  onAddressChange,
}) => {
  // No need for complex parsing since we already have the fields from the API
  // Just ensure the type matches what we need
  const addressesData = addresses.map((addr) => addr as ExtendedAddress)

  // State for modal control
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentAddress, setCurrentAddress] = useState<ExtendedAddress | null>(
    null
  )

  // Handler for saving an address (add or edit)
  const handleSaveAddress = async (formData: AddressFormData) => {
    try {
      const response = await fetch('/api/auth/buyer-profile/POST', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: formData }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          formData.id
            ? 'Address updated successfully'
            : 'Address added successfully'
        )

        // Refresh the parent component to fetch updated addresses
        if (onAddressChange) {
          onAddressChange()
        }
      } else {
        toast.error(result.error || 'Failed to save address')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('An error occurred while saving the address')
      throw error
    }
  }

  // Handler for deleting an address
  const handleDeleteAddress = async () => {
    if (!currentAddress?.id) return

    try {
      const response = await fetch('/api/auth/buyer-profile/DELETE', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId: currentAddress.id }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Address deleted successfully')
        // Refresh the parent component to fetch updated addresses
        if (onAddressChange) {
          onAddressChange()
        }
      } else {
        toast.error(result.error || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('An error occurred while deleting the address')
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="mt-8 mb-40">
      {addressesData.map((addressObj, index) => (
        <div
          key={index}
          className="flex items-center justify-between w-full mt-6 mb-10"
        >
          <div className="flex flex-col w-full pt-4 font-semibold md:text-xl">
            <div className="flex items-center justify-between">
              <div className="pb-2">
                {addressObj.label}
                {addressObj.isDefault && (
                  <span className="px-2 py-1 ml-2 text-xs text-white rounded-full bg-green">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center md:text-lg">
                <button
                  onClick={() => {
                    console.log('Selected address for edit:', addressObj)
                    setCurrentAddress(addressObj)
                    setIsEditModalOpen(true)
                  }}
                  className="mx-2 hover:underline text-green"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setCurrentAddress(addressObj)
                    setIsDeleteDialogOpen(true)
                  }}
                  className="mx-2 hover:underline text-orange"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-sm font-normal text-disabledgrey">
              {addressObj.address}
            </div>
          </div>
        </div>
      ))}

      {/* Add Address Modal */}
      <AddressFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSaveAddress}
        title="Add New Address"
      />

      {/* Edit Address Modal */}
      {currentAddress && (
        <AddressFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSaveAddress}
          initialData={{
            id: currentAddress.id,
            street: currentAddress.street,
            city: currentAddress.city,
            state: currentAddress.state,
            postalCode: currentAddress.postalCode,
            country: currentAddress.country,
            isDefault: currentAddress.isDefault || false,
            label: currentAddress.label || '', // Include the label property
          }}
          title="Edit Address"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              address from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AccountAddress
