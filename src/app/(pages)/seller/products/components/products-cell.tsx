'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ProductDataProps } from '@/app/types/type'
import { EditProductModal } from './edit-product-modal'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import CurrencyFormatter from '@/app/components/ui-utils/currency-format'
import axios from 'axios'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertTriangle,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
  Trash2,
} from 'lucide-react'

export const ProductCell = ({ product }: { product: ProductDataProps }) => {
  const defaultImage = product.images?.find(
    (img: { isDefault: boolean }) => img.isDefault
  ) ||
    product.images?.[0] || {
      urlpath: '/placeholder.png',
    }

  return (
    <div className="flex items-center gap-x-2">
      <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
        <Image
          src={defaultImage.urlpath}
          alt={defaultImage.alt || 'Product Image'}
          width={80}
          height={80}
          className="rounded-md object-cover w-full h-full "
        />
      </div>
      <div>
        {product.isSale && (
          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
            🔥 SALE
          </div>
        )}
        <p className="font-semibold">{product.name}</p>
        <p className="text-xs text-muted-foreground">ID: {product.id}</p>
        <p className="text-xs text-muted-foreground">
          Stock: {product.quantity}
        </p>
        <p className="text-sm text-orange-500 font-medium">
          <CurrencyFormatter amount={product.basePrice} />
        </p>
      </div>
    </div>
  )
}

export const CategoryCell = ({ category }: { category: string }) => (
  <span className="text-sm text-muted-foreground">{category}</span>
)

export const LastUpdatedCell = ({ product }: { product: ProductDataProps }) => (
  <span className="text-sm text-gray-600">
    {product.updatedAt
      ? new Date(product.updatedAt).toLocaleDateString()
      : new Date(product.createdAt).toLocaleDateString()}
  </span>
)

export const StatusCell = ({ product }: { product: ProductDataProps }) => {
  const color =
    product.status === 'approved'
      ? 'text-green-600'
      : product.status === 'rejected'
        ? 'text-red-500'
        : product.status === 'pending'
          ? 'text-yellow-500'
          : 'text-orange-500'

  return (
    <span className={`px-2 py-1 rounded-full ${color} text-sm`}>
      {product.status.toUpperCase()}
    </span>
  )
}

export const ActiveCell = ({ product }: { product: ProductDataProps }) => {
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${
        product.isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {product.isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

export const ActionsCell = ({
  product,
  onDeleted,
}: {
  product: ProductDataProps
  onDeleted?: () => void
}) => {
  const [openDelete, setOpenDelete] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingActive, setIsTogglingActive] = useState(false)

  const queryClient = useQueryClient()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await axios.delete(`/api/seller-products/delete?id=${product.id}`)
      toast.success('Product deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['productSeller'] })
      onDeleted?.()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete product')
    } finally {
      setIsDeleting(false)
      setOpenDelete(false)
    }
  }
  const handleToggleActive = async () => {
    if (product.status !== 'approved' && !product.isActive) {
      toast.error('Only approved products can be activated.')
      return
    }

    try {
      setIsTogglingActive(true)
      await axios.put(`/api/seller-products/update-visibility`, {
        id: product.id,
        isActive: !product.isActive,
      })
      queryClient.invalidateQueries({ queryKey: ['productSeller'] })
      toast.success(
        `Product ${product.isActive ? 'deactivated' : 'activated'} successfully`
      )
    } catch (error) {
      console.error('Toggle isActive failed:', error)
      toast.error('Failed to update product visibility')
    } finally {
      setIsTogglingActive(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="center"
            className="w-48 shadow-lg border border-gray-200"
          >
            {/* Edit Action */}
            <DropdownMenuItem
              onClick={() => setOpenEdit(true)}
              className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 group"
            >
              <Edit3 className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
              <span className="text-gray-700 group-hover:text-blue-600">
                Edit Product
              </span>
            </DropdownMenuItem>

            {/* Toggle Visibility Action */}
            <DropdownMenuItem
              onClick={handleToggleActive}
              disabled={
                isTogglingActive ||
                (!product.isActive && product.status !== 'approved')
              }
              className="flex items-center gap-2 cursor-pointer hover:bg-amber-50 focus:bg-amber-50 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTogglingActive ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              ) : product.isActive ? (
                <EyeOff className="h-4 w-4 text-amber-500 group-hover:text-amber-600" />
              ) : (
                <Eye className="h-4 w-4 text-amber-500 group-hover:text-amber-600" />
              )}
              <span className="text-gray-700 group-hover:text-amber-600">
                {isTogglingActive
                  ? 'Updating...'
                  : product.isActive
                    ? 'Deactivate'
                    : 'Activate'}
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200" />

            {/* Delete Action */}
            <DropdownMenuItem
              onClick={() => setOpenDelete(true)}
              className="flex items-center gap-2 cursor-pointer hover:bg-red-50 focus:bg-red-50 group"
            >
              <Trash2 className="h-4 w-4 text-red-500 group-hover:text-red-600" />
              <span className="text-red-600 group-hover:text-red-700 font-medium">
                Delete Product
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Delete Product
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">
                &quot;{product.name}&quot;
              </span>
              ? This will permanently remove the product from your inventory.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              disabled={isDeleting}
              className="order-2 sm:order-1 mx-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="order-1 sm:order-2 min-w-[100px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <EditProductModal
        product={product}
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['productSeller'] })
          setOpenEdit(false)
        }}
      />
    </>
  )
}
