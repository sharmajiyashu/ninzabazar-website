'use client'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Trash2, X } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSession } from 'next-auth/react'
import { ShippingMethod } from '@/app/types/type'
import { toast } from 'sonner'

const productSchema = z.object({
  productName: z.string().min(1, 'Product Name is required'),
  category: z.string().min(4, 'Category is required'),
  productKeywords: z
    .string()
    .min(1, 'Product Keywords are required')
    .transform((str) =>
      str
        .split(',')
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0)
    ),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.coerce.number().min(0.01, 'Base Price must be greater than 0'),
  shippingMethods: z.boolean().default(false),
  variantsOpen: z.boolean().default(false),
  MOQOpen: z.boolean().default(false),
  subCategory: z.string().optional(),
  isSale: z.boolean().default(false),
  salePrice: z.coerce.number().min(0).optional(),
}).superRefine((data, ctx) => {
  if (data.isSale) {
    if (!data.salePrice || data.salePrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sale price must be greater than 0',
        path: ['salePrice'],
      })
    } else if (data.salePrice >= data.basePrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sale price must be less than base price',
        path: ['salePrice'],
      })
    }
  }
})

type ProductFormValues = z.infer<typeof productSchema>

type ExistingImage = {
  id: string
  urlpath: string
}

function groupVariantsByTitle(
  dbVariants: Array<{
    title: string
    option: string
    hasPrice: boolean
    price: number | string
  }>
) {
  const map = new Map<
    string,
    {
      title: string
      options: Array<{ value: string; hasPrice: boolean; price: number }>
    }
  >()

  for (const variant of dbVariants) {
    if (!map.has(variant.title)) {
      map.set(variant.title, { title: variant.title, options: [] })
    }
    map.get(variant.title)!.options.push({
      value: variant.option,
      hasPrice: variant.hasPrice,
      price: Number(variant.price),
    })
  }

  return Array.from(map.values())
}

const PostPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editProductId = searchParams.get('edit')
  const isEditMode = Boolean(editProductId)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      category: '',
      productKeywords: '',
      description: '',
      basePrice: 0,
      variantsOpen: false,
      MOQOpen: false,
      shippingMethods: false,
      subCategory: '',
      isSale: false,
      salePrice: 0,
    },
  })

  // left at adding ui or forms to accept shipping mthods, cour dhl

  // Watch the checkbox values
  const variantsOpen = watch('variantsOpen')
  const MOQOpen = watch('MOQOpen')
  const isSale = watch('isSale')

  // State for multiple images
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode)
  // Loading State
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for dynamic sections
  const [variants, setVariants] = useState([
    {
      title: '',
      options: [{ value: '', hasPrice: false, price: 0 }],
    },
  ])
  // State for MOQs (Minimum Order Quantities)
  const [moqs, setMoqs] = useState([{ quantityRange: '', price: 0 }])
  // State for shipping methods
  const [shippingMethods, setShippingMethods] = useState([
    {
      name: '',
      price: 0,
      estimatedDays: '',
      description: '',
      isActive: true,
    },
  ])

  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([])
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
  const [minOrderQuantity, setMinOrderQuantity] = useState<number | ''>('')
  const [inventory, setInventory] = useState<number | ''>('')
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ])
  const [availableColors, setAvailableColors] = useState<{ id: string; name: string; hexCode?: string }[]>([])
  const [availableMaterials, setAvailableMaterials] = useState<{ id: string; name: string }[]>([])

  const subCategoryValue = watch('subCategory')
  const categoryValue = watch('category')
  const { data: session } = useSession()

  // Image handling functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    // Limit to 5 images maximum
    if (existingImages.length + newImages.length + files.length > 5) {
      alert('Maximum 5 images allowed')
      return
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Update images state
    setNewImages((prev) => [...prev, ...validFiles])

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    // Clear the input
    event.target.value = ''
  }

  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index))
    } else {
      const newIndex = index - existingImages.length
      setNewImages((prev) => prev.filter((_, i) => i !== newIndex))
      setNewImagePreviews((prev) => prev.filter((_, i) => i !== newIndex))
    }
  }

  const clearNewImages = () => {
    setNewImages([])
    setNewImagePreviews([])
  }

  const allImagePreviews = [
    ...existingImages.map((img) => img.urlpath),
    ...newImagePreviews,
  ]

  const addShippingMethod = () => {
    setShippingMethods((prev) => [
      ...prev,
      {
        name: '',
        price: 0,
        estimatedDays: '',
        description: '',
        isActive: true,
      },
    ])
  }

  const updateShippingMethod = (
    index: number,
    field: keyof ShippingMethod,
    value: any //eslint-disable-line
  ) => {
    const updated = shippingMethods.map((method, i) =>
      i === index ? { ...method, [field]: value } : method
    )
    setShippingMethods(updated)
  }

  const removeShippingMethod = (index: number) => {
    if (shippingMethods.length > 1) {
      setShippingMethods((prev) => prev.filter((_, i) => i !== index))
    }
  }

  // Variant management functions
  //eslint-disable-next-line
  const updateVariant = (variantIndex: number, field: string, value: any) => {
    const updatedVariants = [...variants]
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      [field]: value,
    }
    setVariants(updatedVariants)
  }

  const updateVariantOption = (
    variantIndex: number,
    optionIndex: number,
    field: string,
    value: any //eslint-disable-line
  ) => {
    const updatedVariants = [...variants]
    updatedVariants[variantIndex].options[optionIndex] = {
      ...updatedVariants[variantIndex].options[optionIndex],
      [field]: value,
    }
    setVariants(updatedVariants)
  }

  const addVariantOption = (variantIndex: number) => {
    const updatedVariants = [...variants]
    updatedVariants[variantIndex].options.push({
      value: '',
      hasPrice: false,
      price: 0,
    })
    setVariants(updatedVariants)
  }

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        title: '',
        options: [{ value: '', hasPrice: false, price: 0 }],
      },
    ])
  }

  const removeVariant = (variantIndex: number) => {
    setVariants((prev) => prev.filter((_, index) => index !== variantIndex))
  }

  // const updateMoq = (moqIndex: number, field: string, value: any) => {
  //   const updatedMoqs = [...moqs]
  //   updatedMoqs[moqIndex] = { ...updatedMoqs[moqIndex], [field]: value }
  //   setMoqs(updatedMoqs)
  // }

  // const addMoq = () => {
  //   setMoqs((prev) => [...prev, { quantityRange: '', price: 0 }])
  // }

  // const removeMoq = (moqIndex: number) => {
  //   setMoqs((prev) => prev.filter((_, index) => index !== moqIndex))
  // }

  const [fetchedCategories, setFetchedCategories] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (Array.isArray(data)) {
          setFetchedCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCats();
  }, []);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const selectedCat = fetchedCategories.find((c: { id: string }) => c.id === categoryValue)
        const params = new URLSearchParams()
        if (selectedCat?.name) params.set('category', selectedCat.name)
        const res = await fetch(`/api/product-settings?${params.toString()}`)
        const data = await res.json()
        setAvailableColors(data.colors || [])
        setAvailableMaterials(data.materials || [])
      } catch (err) {
        console.error('Failed to fetch product settings', err)
      }
    }
    fetchSettings()
  }, [categoryValue, fetchedCategories])

  React.useEffect(() => {
    if (!editProductId) return

    const loadProduct = async () => {
      try {
        setIsLoadingProduct(true)
        const res = await fetch(`/api/seller-products/get?id=${editProductId}`)
        if (!res.ok) {
          toast.error('Failed to load product for editing')
          router.push('/seller/products')
          return
        }

        const product = await res.json()

        reset({
          productName: product.name,
          category: product.categoryId || product.category?.id || '',
          subCategory: product.subCategoryId || product.subCategory?.id || 'none',
          productKeywords: product.keywords?.join(', ') || '',
          description: product.description,
          basePrice: Number(product.basePrice),
          isSale: product.isSale,
          salePrice: Number(product.salePrice ?? 0),
          variantsOpen: product.variants?.length > 0,
          MOQOpen: false,
          shippingMethods: false,
        })

        setExistingImages(
          (product.images || []).map(
            (img: { id: string; urlpath: string }) => ({
              id: img.id,
              urlpath: img.urlpath,
            })
          )
        )
        setNewImages([])
        setNewImagePreviews([])

        if (product.shippingMethods?.length > 0) {
          setShippingMethods(
            product.shippingMethods.map(
              (method: {
                name: string
                price: number | string
                estimatedDays: string
                description?: string
                isActive: boolean
              }) => ({
                name: method.name,
                price: Number(method.price),
                estimatedDays: method.estimatedDays,
                description: method.description || '',
                isActive: method.isActive,
              })
            )
          )
        }

        if (product.variants?.length > 0) {
          const grouped = groupVariantsByTitle(product.variants)
          setVariants(
            grouped.length > 0
              ? grouped
              : [
                  {
                    title: '',
                    options: [{ value: '', hasPrice: false, price: 0 }],
                  },
                ]
          )
        }

        setSelectedColorIds(product.colorIds || [])
        setSelectedMaterialIds(product.materialIds || [])
        setMinOrderQuantity(product.minOrderQuantity ?? '')
        setInventory(product.inventory ?? '')
        setSpecifications(
          product.specifications?.length
            ? product.specifications.map((s: { key: string; value: string }) => ({
                key: s.key,
                value: s.value,
              }))
            : [{ key: '', value: '' }]
        )
      } catch (error) {
        console.error('Failed to load product', error)
        toast.error('Failed to load product for editing')
        router.push('/seller/products')
      } finally {
        setIsLoadingProduct(false)
      }
    }

    loadProduct()
  }, [editProductId, reset, router]);

  const selectedCategoryObj = React.useMemo(() => {
    return fetchedCategories.find(c => c.id === watch('category'));
  }, [fetchedCategories, watch('category')]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (existingImages.length + newImages.length === 0) {
        toast.error('Please select at least one product image')
        return
      }

      const validShippingMethods = shippingMethods.filter(
        (method) =>
          method.name.trim() && method.price >= 0 && method.estimatedDays
      )

      if (validShippingMethods.length === 0) {
        toast.error('Please add at least one valid shipping method')
        return
      }

      setIsSubmitting(true)

      const filteredShippingMethods = shippingMethods.filter(
        (m) =>
          m.name.trim() &&
          m.estimatedDays.trim() &&
          typeof m.price === 'number' &&
          m.price >= 0
      )

      const keywords =
        typeof data.productKeywords === 'string'
          ? data.productKeywords
          : data.productKeywords.join(',')

      const formDataToSend = new FormData()
      formDataToSend.append('name', data.productName)
      formDataToSend.append('categoryId', data.category)
      if (data.subCategory) {
        formDataToSend.append('subCategoryId', data.subCategory)
      }
      formDataToSend.append('colorIds', JSON.stringify(selectedColorIds))
      formDataToSend.append('materialIds', JSON.stringify(selectedMaterialIds))
      if (minOrderQuantity !== '') {
        formDataToSend.append('minOrderQuantity', String(minOrderQuantity))
      }
      if (inventory !== '') {
        formDataToSend.append('inventory', String(inventory))
      }
      formDataToSend.append(
        'specifications',
        JSON.stringify(specifications.filter((s) => s.key.trim() && s.value.trim()))
      )
      formDataToSend.append('keywords', keywords)
      formDataToSend.append('description', data.description)
      formDataToSend.append('basePrice', data.basePrice.toString())
      formDataToSend.append('isSale', String(data.isSale))
      if (data.isSale && data.salePrice) {
        formDataToSend.append('salePrice', data.salePrice.toString())
      }
      formDataToSend.append('sellerId', session?.user.id ?? '')

      if (isEditMode && editProductId) {
        formDataToSend.append('productId', editProductId)
        formDataToSend.append('existingImages', JSON.stringify(existingImages))
      }

      newImages.forEach((image) => {
        formDataToSend.append('productImages', image)
      })
      formDataToSend.append(
        'shippingMethods',
        JSON.stringify(filteredShippingMethods)
      )

      if (data.variantsOpen) {
        const filteredVariants = variants.filter((v) => v.title.trim())
        formDataToSend.append('variants', JSON.stringify(filteredVariants))
      }

      if (data.MOQOpen) {
        const filteredMoqs = moqs.filter((m) => m.quantityRange.trim())
        formDataToSend.append('moqs', JSON.stringify(filteredMoqs))
      }

      const response = await fetch(
        isEditMode ? '/api/products/put' : '/api/products/post',
        {
          method: 'POST',
          body: formDataToSend,
        }
      )

      const result = await response.json()

      if (response.ok) {
        toast.success(
          isEditMode
            ? 'Product updated successfully!'
            : 'Product created successfully!'
        )
        router.push('/seller/products')
        return result
      }

      toast.error(result.error || result.message || 'Something went wrong')
      return result
    } catch (error) {
      console.log(error)
      toast.error('Network error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onError = (errors: Record<string, unknown>) => {
    console.log('Form validation errors:', errors)
  }

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green" />
      </div>
    )
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex-1 mx-4 md:mx-10 my-10 max-w-6xl"
      >
        {/* Product Information */}
        <div className="border-b pb-8 border-gray-200">
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Product' : 'Product Information'}
          </h1>
          <div className="space-y-6 mt-6">
            {/* PRODUCT NAME */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <div className="w-full md:w-36 flex-shrink-0">
                <h2>
                  <span className="text-[#EE2932]">*</span> Product Name
                </h2>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Product Name Here"
                  className="w-full h-10"
                  {...register('productName')}
                />
                {errors.productName && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.productName.message}
                  </span>
                )}
              </div>
            </div>

            {/* CATEGORY */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <div className="w-full md:w-36 flex-shrink-0">
                <h2>
                  <span className="text-[#EE2932]">*</span> Category
                </h2>
              </div>
              <div className="flex-1">
                <Select
                  value={watch('category')}
                  onValueChange={(value) => {
                    setValue('category', value, { shouldValidate: true })
                    setValue('subCategory', '') // reset subcategory on category change
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {fetchedCategories.map((category, index) => (
                        <SelectItem key={index} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.category.message}
                  </span>
                )}
              </div>
            </div>

            {/* SUBCATEGORY */}
            {selectedCategoryObj && selectedCategoryObj.subCategories && selectedCategoryObj.subCategories.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mt-4">
                <div className="w-full md:w-36 flex-shrink-0">
                  <h2>
                    Subcategory
                  </h2>
                </div>
                <div className="flex-1">
                  <Select
                    value={watch('subCategory')}
                    onValueChange={(value) =>
                      setValue('subCategory', value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a subcategory (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">None</SelectItem>
                        {selectedCategoryObj.subCategories.map((sub: any, index: number) => (
                          <SelectItem key={index} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* COLORS, MATERIALS, MOQ */}
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6 mt-4">
              <div className="w-full md:w-36 flex-shrink-0">
                <h2>Product Attributes</h2>
              </div>
              <div className="flex-1 space-y-4">
                {availableColors.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Colors</label>
                    <div className="flex flex-wrap gap-3">
                      {availableColors.map((color) => (
                        <label key={color.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedColorIds.includes(color.id)}
                            onChange={() =>
                              setSelectedColorIds((prev) =>
                                prev.includes(color.id) ? prev.filter((id) => id !== color.id) : [...prev, color.id]
                              )
                            }
                          />
                          <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hexCode || '#e5e7eb' }} />
                          {color.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {availableMaterials.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Materials</label>
                    <div className="flex flex-wrap gap-3">
                      {availableMaterials.map((material) => (
                        <label key={material.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMaterialIds.includes(material.id)}
                            onChange={() =>
                              setSelectedMaterialIds((prev) =>
                                prev.includes(material.id) ? prev.filter((id) => id !== material.id) : [...prev, material.id]
                              )
                            }
                          />
                          {material.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Min. Order (Pieces)</label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 100"
                    value={minOrderQuantity}
                    onChange={(e) => setMinOrderQuantity(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="max-w-xs h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Inventory (Stock)</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 500"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="max-w-xs h-10"
                  />
                </div>
              </div>
            </div>

            {/* PRODUCT SPECIFICATIONS */}
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6 mt-4">
              <div className="w-full md:w-36 flex-shrink-0">
                <h2>Specifications</h2>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-xs text-gray-500 italic">
                  Add product specs (e.g. Noise cancelling, Bluetooth version, Material)
                </p>
                {specifications.map((spec, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-start">
                    <Input
                      type="text"
                      placeholder="Spec name (e.g. Bluetooth)"
                      value={spec.key}
                      onChange={(e) => {
                        const next = [...specifications]
                        next[index] = { ...next[index], key: e.target.value }
                        setSpecifications(next)
                      }}
                      className="h-10 flex-1"
                    />
                    <Input
                      type="text"
                      placeholder="Value (e.g. v5.4)"
                      value={spec.value}
                      onChange={(e) => {
                        const next = [...specifications]
                        next[index] = { ...next[index], value: e.target.value }
                        setSpecifications(next)
                      }}
                      className="h-10 flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setSpecifications((prev) =>
                          prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  onClick={() => setSpecifications((prev) => [...prev, { key: '', value: '' }])}
                >
                  + Add Specification
                </Button>
              </div>
            </div>

            {/* PRODUCT KEYWORDS */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <div className="w-full md:w-36 flex-shrink-0">
                <h2>
                  <span className="text-[#EE2932]">*</span> Product Keywords
                </h2>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Product keywords"
                  className="w-full h-10"
                  {...register('productKeywords')}
                />
                <span className="text-xs text-gray-500 font-light italic mt-1 block">
                  Note: Make sure keywords are separated by comma
                </span>
                {errors.productKeywords && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.productKeywords.message}
                  </span>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
              <div className="w-full md:w-36 flex-shrink-0">
                <h2>
                  <span className="text-[#EE2932]">*</span> Description
                </h2>
              </div>
              <div className="flex-1 flex flex-col">
                <Textarea
                  placeholder="Description"
                  className="w-full min-h-[120px] max-h-44 max-w-4xl resize-y"
                  {...register('description')}
                />
                {errors.description && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.description.message}
                  </span>
                )}
              </div>
            </div>

            {/* BASE PRICE */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <div className="w-full md:w-36 flex-shrink-0">
                <h2>
                  <span className="text-[#EE2932]">*</span> Base Price
                </h2>
              </div>
              <div className="flex-1 flex-col">
                <div className="flex flex-row items-center space-x-2">
                  <span className="text-lg font-bold text-gray-500">₹</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-auto h-10"
                    {...register('basePrice')}
                  />
                </div>
                <span className="text-xs text-gray-500 font-light italic mt-1 block">
                  Note: prices must be in INR
                </span>
                {errors.basePrice && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.basePrice.message}
                  </span>
                )}
              </div>
            </div>

            {/* ON SALE */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <div className="w-full md:w-36 flex-shrink-0">
                <h2>On Sale</h2>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={isSale}
                    onCheckedChange={(checked) => {
                      setValue('isSale', checked)
                      if (!checked) setValue('salePrice', 0)
                    }}
                  />
                  <span className="text-sm text-gray-600">
                    Mark this product as on sale
                  </span>
                </div>
                {isSale && (
                  <div className="flex flex-row items-center space-x-2">
                    <span className="text-lg font-bold text-gray-500">₹</span>
                    <Input
                      type="number"
                      placeholder="Sale price"
                      step="0.01"
                      min="0"
                      className="w-auto h-10"
                      {...register('salePrice')}
                    />
                  </div>
                )}
                {errors.salePrice && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.salePrice.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <div className="w-full md:w-36 flex-shrink-0">
                <h2>
                  <span className="text-[#EE2932]">*</span> Check the following
                  if applicable
                </h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={variantsOpen}
                    onCheckedChange={(checked) =>
                      setValue('variantsOpen', Boolean(checked))
                    }
                    id="variants"
                  />
                  <label
                    htmlFor="variants"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Variants
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    disabled
                    checked={MOQOpen}
                    onCheckedChange={(checked) =>
                      setValue('MOQOpen', Boolean(checked))
                    }
                    id="moq"
                  />
                  <label
                    htmlFor="moq"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Minimum Order Quantity (coming soon)
                  </label>
                </div>
              </div>
            </div>

            {/* PRODUCT IMAGES - Updated for multiple images */}
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
              <div className="w-full md:w-36 flex-shrink-0">
                <h2>
                  <span className="text-[#EE2932]">*</span> Product Images
                </h2>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="w-full h-10 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearNewImages}
                    disabled={newImages.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-gray-500 font-light italic">
                  Note: You can select multiple images (max 5, up to 5MB each)
                  {isEditMode && ' — existing images are kept unless removed'}
                </span>

                {allImagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                    {allImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover border rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {allImagePreviews.length > 0 && (
                  <span className="text-sm text-green-600">
                    {allImagePreviews.length} image(s) total
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="flex justify-between items-center my-4">
          <h2>
            <span className="text-[#EE2932]">*</span> Shipping Methods
          </h2>
          <Button
            type="button"
            onClick={addShippingMethod}
            className="h-8 px-4 bg-green hover:bg-green-800"
          >
            Add Method
          </Button>
        </div>

        {shippingMethods.map((method, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="text-[#EE2932]">*</span> Method Name
                </label>
                <Input
                  type="text"
                  value={method.name}
                  onChange={(e) =>
                    updateShippingMethod(index, 'name', e.target.value)
                  }
                  placeholder="e.g., DHL Standard Delivery"
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="text-[#EE2932]">*</span> Price (INR)
                </label>
                <Input
                  type="number"
                  value={method.price}
                  onChange={(e) =>
                    updateShippingMethod(
                      index,
                      'price',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="50"
                  min="0"
                  step="0.01"
                  className="w-full h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="text-[#EE2932]">*</span> Estimated Delivery
                </label>
                <Input
                  type="text"
                  value={method.estimatedDays}
                  onChange={(e) =>
                    updateShippingMethod(index, 'estimatedDays', e.target.value)
                  }
                  placeholder="e.g., 3-5 days"
                  className="w-full h-10"
                />
              </div>
              <div className="flex items-center space-x-4 pt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={method.isActive}
                    onCheckedChange={(checked) =>
                      updateShippingMethod(index, 'isActive', Boolean(checked))
                    }
                    id={`active-${index}`}
                  />
                  <label htmlFor={`active-${index}`} className="text-sm">
                    Active
                  </label>
                </div>
                {shippingMethods.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeShippingMethod(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description (Optional)
              </label>
              <Textarea
                value={method.description}
                onChange={(e) =>
                  updateShippingMethod(index, 'description', e.target.value)
                }
                placeholder="Additional details about this shipping method"
                className="w-full"
                rows={2}
              />
            </div>
          </div>
        ))}

        {/* Variants section */}
        {variantsOpen && (
          <div className="border-b border-gray-200 py-10">
            <h1 className="text-2xl font-bold">Variants</h1>
            <div className="space-y-6 mt-6">
              {variants.map((variant, variantIndex) => (
                <div
                  key={variantIndex}
                  className="border border-gray-400 rounded-lg p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Variant Info */}
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <div className="w-full md:w-32 flex-shrink-0">
                          <h2>
                            <span className="text-[#EE2932]">*</span> Variant
                            Title
                          </h2>
                        </div>
                        <Input
                          type="text"
                          placeholder="Color, Size, etc."
                          className="w-full h-10"
                          value={variant.title}
                          onChange={(e) =>
                            updateVariant(variantIndex, 'title', e.target.value)
                          }
                        />
                      </div>

                      {/* Remove Variant Button */}
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(variantIndex)}
                          className="text-red-500 border-red-500"
                        >
                          Remove Variant
                        </Button>
                      )}
                    </div>

                    {/* Right Column - Variant Options */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Variant Options</h3>
                      {variant.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="space-y-2 p-3 border rounded"
                        >
                          <Input
                            type="text"
                            placeholder="Blue, Size 32, etc."
                            className="w-full h-10"
                            value={option.value}
                            onChange={(e) =>
                              updateVariantOption(
                                variantIndex,
                                optionIndex,
                                'value',
                                e.target.value
                              )
                            }
                          />
                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={option.hasPrice}
                                onCheckedChange={(checked) =>
                                  updateVariantOption(
                                    variantIndex,
                                    optionIndex,
                                    'hasPrice',
                                    Boolean(checked)
                                  )
                                }
                                id={`hasPrice-${variantIndex}-${optionIndex}`}
                              />
                              <label
                                htmlFor={`hasPrice-${variantIndex}-${optionIndex}`}
                                className="text-sm"
                              >
                                Has Price
                              </label>
                            </div>
                            {option.hasPrice && (
                              <Input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-24 h-8"
                                value={option.price || ''}
                                onChange={(e) =>
                                  updateVariantOption(
                                    variantIndex,
                                    optionIndex,
                                    'price',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addVariantOption(variantIndex)}
                        className="w-full"
                      >
                        + Add Option
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={addVariant}
                  className="h-12 px-4 rounded-full bg-[#FF6C00] hover:bg-[#FF6C00]/90"
                >
                  Add Variant
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-10">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/seller/products')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-4 bg-[#007350] hover:bg-[#007350]/90 rounded-lg"
          >
            {isSubmitting
              ? isEditMode
                ? 'Saving Changes...'
                : 'Creating Product...'
              : isEditMode
                ? 'Save Changes'
                : 'Post Product'}
          </Button>
        </div>
      </form>
    </>
  )
}

const Page = () => (
  <React.Suspense
    fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green" />
      </div>
    }
  >
    <PostPageContent />
  </React.Suspense>
)

export default Page
