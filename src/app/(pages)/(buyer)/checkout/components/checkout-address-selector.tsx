'use client'

import { useState } from 'react'
import { MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AddressFormModal from '@/app/(pages)/(buyer)/account/components/address-form-modal'
import { AddressFormData } from '@/app/types/type'
import { formatPhoneNumber } from '@/lib/phoneNumFormatter'
import { toast } from 'sonner'

export interface CheckoutAddress {
  id: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
  label?: string
}

interface CheckoutAddressSelectorProps {
  addresses: CheckoutAddress[]
  selectedAddressId: string | null
  onSelectAddress: (addressId: string) => void
  onAddressSaved: () => void
  userName: string
  contactNumber?: string
}

function formatAddressLine(address: CheckoutAddress) {
  return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`
}

export default function CheckoutAddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddressSaved,
  userName,
  contactNumber,
}: CheckoutAddressSelectorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const selectedAddress =
    addresses.find((addr) => addr.id === selectedAddressId) ||
    addresses.find((addr) => addr.isDefault) ||
    addresses[0] ||
    null

  const hasDefaultAddress = addresses.some((addr) => addr.isDefault)

  const handleSaveAddress = async (formData: AddressFormData) => {
    const response = await fetch('/api/auth/buyer-profile/POST', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: formData }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to save address')
    }

    toast.success(
      formData.id ? 'Address updated successfully' : 'Address added successfully'
    )
    await onAddressSaved()
    setIsAddModalOpen(false)
    setIsPickerOpen(false)
  }

  const handleSelectAddress = (addressId: string) => {
    onSelectAddress(addressId)
    setIsPickerOpen(false)
  }

  return (
    <>
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex flex-row justify-between items-start mb-4">
          <div className="flex flex-row items-center gap-3">
            <MapPin className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Shipping Address
            </h2>
          </div>
          {addresses.length > 0 && (
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="text-green-700 hover:text-green-800 text-lg font-medium hover:underline"
            >
              Change
            </button>
          )}
        </div>

        <div className="ml-9 space-y-3">
          <h3 className="text-lg font-medium text-gray-900">{userName}</h3>

          {selectedAddress ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">
                  {selectedAddress.label || 'Address'}
                </span>
                {selectedAddress.isDefault && (
                  <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">
                    Default
                  </span>
                )}
              </div>
              <p className="text-gray-700">{selectedAddress.street}</p>
              <p className="text-gray-600 text-sm">
                {selectedAddress.city}, {selectedAddress.state}{' '}
                {selectedAddress.postalCode}, {selectedAddress.country}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-600 mb-4">
                No shipping address saved. Add one to continue checkout.
              </p>
              <Button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Shipping Address
              </Button>
            </div>
          )}

          {contactNumber && (
            <p className="text-gray-700">{formatPhoneNumber(contactNumber)}</p>
          )}

          {addresses.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(true)}
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Shipping Address</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {addresses.map((address) => {
              const isSelected = selectedAddressId === address.id

              return (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => handleSelectAddress(address.id)}
                  className={`w-full text-left rounded-lg border p-4 transition-colors ${
                    isSelected
                      ? 'border-green-600 bg-green-50 ring-1 ring-green-600'
                      : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {address.label || 'Address'}
                    </span>
                    {address.isDefault && (
                      <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{formatAddressLine(address)}</p>
                </button>
              )
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsPickerOpen(false)
              setIsAddModalOpen(true)
            }}
            className="w-full border-green-600 text-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        </DialogContent>
      </Dialog>

      <AddressFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSaveAddress}
        title="Add Shipping Address"
        hasDefaultAddress={hasDefaultAddress}
      />
    </>
  )
}
