'use client'
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { AddressFormData } from '@/app/types/type'

// Update the interface to include the label field
interface AddressFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (addressData: AddressFormData & { label: string }) => Promise<void>
  initialData?: (AddressFormData & { label?: string }) | null
  title: string
  hasDefaultAddress?: boolean
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  hasDefaultAddress = false,
}) => {
  const [formData, setFormData] = useState<AddressFormData & { label: string }>(
    initialData?.label
      ? { ...initialData, label: initialData.label }
      : {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
          isDefault: false,
          label: '',
        }
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        label: initialData.label || '',
      })
    }
  }, [initialData])

  // Auto-suggest "Default" label when isDefault is checked
  useEffect(() => {
    if (formData.isDefault && !formData.label) {
      setFormData((prev) => ({ ...prev, label: 'Default' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.isDefault])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isDefault: checked,
      // Suggest "Default" label if checked and label is empty
      label: checked && !prev.label ? 'Default' : prev.label,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Ensure we have a label, default to "Other" if not provided
    if (!formData.label) {
      setFormData((prev) => ({
        ...prev,
        label: prev.isDefault ? 'Default' : 'Other',
      }))
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting address:', error)
      toast.error('Failed to save address. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* New Label field */}
            <div className="grid gap-2">
              <Label htmlFor="label">Address Label</Label>
              <Input
                id="label"
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder={
                  formData.isDefault ? 'Default' : 'Home, Work, etc.'
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="New York"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="NY"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="postalCode">Postal/Zip Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  placeholder="10001"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  placeholder="USA"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={handleCheckboxChange}
              />
              <div>
                <Label htmlFor="isDefault">Set as default address</Label>
                {hasDefaultAddress && !formData.isDefault && (
                  <p className="text-xs text-muted-foreground">
                    Current default address exists
                  </p>
                )}
                {formData.isDefault && hasDefaultAddress && (
                  <p className="text-xs text-muted-foreground">
                    This will replace your current default address
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-green" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddressFormModal
