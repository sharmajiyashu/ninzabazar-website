'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  getListingLabel,
  getReviewStatusLabel,
  isProductApproved,
  resolveReviewStatus,
} from '@/lib/product-status'
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
        <p className="text-sm font-medium">
          {product.isSale && product.salePrice ? (
            <span className="flex items-center gap-2">
              <span className="text-orange-500">
                <CurrencyFormatter amount={Number(product.salePrice)} />
              </span>
              <span className="text-muted-foreground line-through text-xs">
                <CurrencyFormatter amount={Number(product.basePrice)} />
              </span>
            </span>
          ) : (
            <span className="text-orange-500">
              <CurrencyFormatter amount={Number(product.basePrice)} />
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

export const CategoryCell = ({
  category,
  subCategory,
}: {
  category?: { id: string; name: string } | null
  subCategory?: { id: string; name: string } | null
}) => (
  <div className="text-sm text-muted-foreground">
    <p>{category?.name || 'N/A'}</p>
    {subCategory?.name && (
      <p className="text-xs text-gray-400">{subCategory.name}</p>
    )}
  </div>
)

export const LastUpdatedCell = ({ product }: { product: ProductDataProps }) => (
  <span className="text-sm text-gray-600">
    {product.updatedAt
      ? new Date(product.updatedAt).toLocaleDateString()
      : new Date(product.createdAt).toLocaleDateString()}
  </span>
)

export const StatusCell = ({ product }: { product: ProductDataProps }) => {
  const reviewStatus = resolveReviewStatus(
    product.status,
    product.adminApproved
  )

  const config: Record<string, { label: string; className: string }> = {
    approved: {
      label: getReviewStatusLabel('approved'),
      className: 'bg-green-50 text-green-700 border border-green-200',
    },
    pending: {
      label: getReviewStatusLabel('pending'),
      className: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    rejected: {
      label: getReviewStatusLabel('rejected'),
      className: 'bg-red-50 text-red-700 border border-red-200',
    },
  }

  const status = config[reviewStatus] ?? {
    label: product.status,
    className: 'bg-gray-50 text-gray-600 border border-gray-200',
  }

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
    >
      {status.label}
    </span>
  )
}

export const VisibilityCell = ({
  product,
  onRefetch,
}: {
  product: ProductDataProps
  onRefetch?: () => void
}) => {
  const [isToggling, setIsToggling] = useState(false)
  const queryClient = useQueryClient()
  const reviewStatus = resolveReviewStatus(
    product.status,
    product.adminApproved
  )
  const approved = isProductApproved(product.status, product.adminApproved)
  const isLive = Boolean(product.isActive)
  const listingLabel = getListingLabel(reviewStatus, isLive)

  const handleToggle = async () => {
    if (!approved) {
      toast.error(
        reviewStatus === 'rejected'
          ? 'This product was rejected and cannot be listed.'
          : 'Product must be approved by admin before you can publish it.'
      )
      return
    }

    try {
      setIsToggling(true)
      await axios.put('/api/seller-products/update-visibility', {
        id: product.id,
        isActive: !isLive,
      })
      await queryClient.refetchQueries({ queryKey: ['productSeller'] })
      onRefetch?.()
      toast.success(
        isLive
          ? 'Product hidden from your store'
          : 'Product is now live on your store'
      )
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : 'Failed to update listing'
      toast.error(message)
    } finally {
      setIsToggling(false)
    }
  }

  if (!approved) {
    return (
      <span
        title={
          reviewStatus === 'rejected'
            ? 'Admin rejected this product'
            : 'Waiting for admin to review your product'
        }
        className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200"
      >
        {listingLabel}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isToggling}
      title={
        isLive
          ? 'Click to hide from your store'
          : 'Click to publish to your store'
      }
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        isLive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
      } ${isToggling ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
    >
      {isToggling ? 'Updating...' : listingLabel}
    </button>
  )
}

/** @deprecated use VisibilityCell */
export const ActiveCell = VisibilityCell

export const ActionsCell = ({
  product,
  onDeleted,
}: {
  product: ProductDataProps
  onDeleted?: () => void
}) => {
  const router = useRouter()
  const [openDelete, setOpenDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingActive, setIsTogglingActive] = useState(false)

  const queryClient = useQueryClient()
  const reviewStatus = resolveReviewStatus(
    product.status,
    product.adminApproved
  )
  const approved = isProductApproved(product.status, product.adminApproved)
  const isLive = Boolean(product.isActive)

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
    if (!approved) {
      toast.error(
        reviewStatus === 'rejected'
          ? 'This product was rejected and cannot be listed.'
          : 'Product must be approved by admin before you can publish it.'
      )
      return
    }

    try {
      setIsTogglingActive(true)
      await axios.put(`/api/seller-products/update-visibility`, {
        id: product.id,
        isActive: !isLive,
      })
      await queryClient.refetchQueries({ queryKey: ['productSeller'] })
      toast.success(
        isLive
          ? 'Product hidden from your store'
          : 'Product is now live on your store'
      )
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : 'Failed to update listing'
      toast.error(message)
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
              onClick={() => router.push(`/seller/post?edit=${product.id}`)}
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
              disabled={isTogglingActive || !approved}
              className="flex items-center gap-2 cursor-pointer hover:bg-amber-50 focus:bg-amber-50 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTogglingActive ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              ) : isLive ? (
                <EyeOff className="h-4 w-4 text-amber-500 group-hover:text-amber-600" />
              ) : (
                <Eye className="h-4 w-4 text-amber-500 group-hover:text-amber-600" />
              )}
              <span className="text-gray-700 group-hover:text-amber-600">
                {isTogglingActive
                  ? 'Updating...'
                  : !approved
                    ? reviewStatus === 'rejected'
                      ? 'Listing unavailable'
                      : 'Awaiting approval'
                    : isLive
                      ? 'Hide from Store'
                      : 'Publish to Store'}
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
    </>
  )
}
