'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ProductDataProps } from '@/app/types/type'
import axios from 'axios'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface EditProductModalProps {
  product: ProductDataProps
  open: boolean
  onClose: () => void
  onUpdated?: () => void
}

export const EditProductModal = ({
  product,
  open,
  onClose,
  onUpdated,
}: EditProductModalProps) => {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [basePrice, setBasePrice] = useState(product.basePrice)
  const [isSale, setIsSale] = useState(product.isSale)
  const [salePrice, setSalePrice] = useState(product.salePrice ?? 0)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await axios.put('/api/seller-products/put', {
        id: product.id,
        name,
        description,
        basePrice,
        isSale,
        salePrice: isSale ? salePrice : null, // only send if isSale is true
      })
      toast.success('Product updated successfully')
      onUpdated?.()
      onClose()
    } catch (error) {
      console.log('Error updating product:', error)
      setIsSubmitting(false)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="Base Price"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
          />

          <div className="flex items-center justify-between mt-4">
            <label className="text-sm">Is on Sale?</label>
            <Switch checked={isSale} onCheckedChange={setIsSale} />
          </div>

          {isSale && (
            <Input
              placeholder="Sale Price"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-orange text-white hover:bg-orange-600"
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
