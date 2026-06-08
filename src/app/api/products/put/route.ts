import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getValidImageFiles,
  uploadProductImages,
} from '@/lib/product-image-upload'
import { saveProductAttributes } from '@/lib/save-product-attributes'
import { saveProductSpecifications } from '@/lib/save-product-specifications'

function parseVariants(variantsRaw: string | null) {
  if (!variantsRaw || variantsRaw === 'undefined' || variantsRaw.trim() === '') {
    return []
  }

  const parsedVariants = JSON.parse(variantsRaw)
  if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
    return []
  }

  const variantRecords: {
    title: string
    option: string
    hasPrice: boolean
    price: number
    sku: string | null
  }[] = []

  for (const variant of parsedVariants.filter(
    (v) => v && v.title && v.title.trim() !== ''
  )) {
    if (variant.options && Array.isArray(variant.options)) {
      for (const option of variant.options.filter(
        (o: { value: string }) => o && o.value && o.value.trim() !== ''
      )) {
        variantRecords.push({
          title: variant.title,
          option: option.value,
          hasPrice: Boolean(option.hasPrice),
          price:
            option.hasPrice && option.price && !isNaN(parseFloat(option.price))
              ? parseFloat(option.price)
              : 0,
          sku: option.sku || null,
        })
      }
    } else {
      variantRecords.push({
        title: variant.title,
        option: variant.option || 'Default',
        hasPrice: Boolean(variant.hasPrice),
        price:
          variant.hasPrice &&
          variant.price &&
          !isNaN(parseFloat(variant.price))
            ? parseFloat(variant.price)
            : 0,
        sku: variant.sku || null,
      })
    }
  }

  return variantRecords
}

function parseShippingMethods(shippingMethodsRaw: string | null) {
  if (
    !shippingMethodsRaw ||
    shippingMethodsRaw === 'undefined' ||
    shippingMethodsRaw.trim() === ''
  ) {
    return []
  }

  const parsedShippingMethods = JSON.parse(shippingMethodsRaw)
  if (!Array.isArray(parsedShippingMethods) || parsedShippingMethods.length === 0) {
    return []
  }

  return parsedShippingMethods
    .filter(
      (method) =>
        method &&
        method.name &&
        method.name.trim() !== '' &&
        method.estimatedDays &&
        method.estimatedDays.trim() !== '' &&
        typeof method.price === 'number' &&
        method.price >= 0
    )
    .map((method) => ({
      name: method.name.trim(),
      price: parseFloat(method.price) || 0,
      estimatedDays: method.estimatedDays.trim(),
      description: method.description ? method.description.trim() : null,
      isActive: Boolean(method.isActive),
    }))
}

async function handleProductUpdate(req: Request) {
  try {
    const formData = await req.formData()

    const productId = formData.get('productId') as string
    const productName = formData.get('name') as string
    const categoryId = formData.get('categoryId') as string
    const subCategoryId = formData.get('subCategoryId') as string | null
    const productKeywords = formData.get('keywords') as string
    const description = formData.get('description') as string
    const basePrice = formData.get('basePrice') as string
    const isSale = formData.get('isSale') === 'true'
    const salePriceRaw = formData.get('salePrice') as string | null
    const sellerId = formData.get('sellerId') as string
    const variantsRaw = formData.get('variants') as string | null
    const shippingMethodsRaw = formData.get('shippingMethods') as string | null
    const existingImagesRaw = formData.get('existingImages') as string | null
    const newProductImages = getValidImageFiles(formData)

    if (
      !productId ||
      !productName ||
      !categoryId ||
      !description ||
      !basePrice ||
      !sellerId
    ) {
      return NextResponse.json(
        { error: 'Missing required product information' },
        { status: 400 }
      )
    }

    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      include: { sellerProfile: true },
    })

    if (!seller?.sellerProfile?.id) {
      return NextResponse.json(
        { error: 'Invalid seller ID - user does not exist' },
        { status: 400 }
      )
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (existingProduct.sellerId !== seller.sellerProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    let keptImages: { id: string; urlpath: string }[] = []
    try {
      keptImages = existingImagesRaw ? JSON.parse(existingImagesRaw) : []
    } catch {
      return NextResponse.json(
        { error: 'Invalid existing images format' },
        { status: 400 }
      )
    }

    if (keptImages.length === 0 && newProductImages.length === 0) {
      return NextResponse.json(
        { error: 'At least one product image is required' },
        { status: 400 }
      )
    }

    const parsedBasePrice = parseFloat(basePrice)
    const parsedSalePrice = salePriceRaw ? parseFloat(salePriceRaw) : null

    if (isSale) {
      if (!parsedSalePrice || parsedSalePrice <= 0) {
        return NextResponse.json(
          { error: 'Sale price must be greater than 0 when product is on sale' },
          { status: 400 }
        )
      }
      if (parsedSalePrice >= parsedBasePrice) {
        return NextResponse.json(
          { error: 'Sale price must be less than base price' },
          { status: 400 }
        )
      }
    }

    const keywordsArray = productKeywords
      ? productKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : []

    let newImageUrls: string[] = []
    if (newProductImages.length > 0) {
      const uploadResult = await uploadProductImages(newProductImages)
      if (uploadResult.error) {
        return NextResponse.json(
          { error: `Image upload failed: ${uploadResult.error}` },
          { status: 500 }
        )
      }
      newImageUrls = uploadResult.urls
    }

    let variantRecords: ReturnType<typeof parseVariants> = []
    let shippingMethodRecords: ReturnType<typeof parseShippingMethods> = []

    try {
      variantRecords = parseVariants(variantsRaw)
      shippingMethodRecords = parseShippingMethods(shippingMethodsRaw)
    } catch {
      return NextResponse.json(
        { error: 'Invalid variants or shipping methods format' },
        { status: 400 }
      )
    }

    if (shippingMethodRecords.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid shipping method is required' },
        { status: 400 }
      )
    }

    const keptImageIds = keptImages.map((img) => img.id)

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: {
          productId,
          ...(keptImageIds.length > 0
            ? { id: { notIn: keptImageIds } }
            : {}),
        },
      })

      if (newImageUrls.length > 0) {
        await tx.productImage.createMany({
          data: newImageUrls.map((url) => ({
            productId,
            urlpath: url,
            isDefault: false,
          })),
        })
      }

      const remainingImages = await tx.productImage.findMany({
        where: { productId },
        orderBy: { createdAt: 'asc' },
      })

      if (remainingImages.length > 0) {
        const hasDefault = remainingImages.some((img) => img.isDefault)
        if (!hasDefault) {
          await tx.productImage.update({
            where: { id: remainingImages[0].id },
            data: { isDefault: true },
          })
        }
      }

      await tx.productVariant.deleteMany({ where: { productId } })
      await tx.shippingMethod.deleteMany({ where: { productId } })

      await tx.product.update({
        where: { id: productId },
        data: {
          name: productName,
          keywords: keywordsArray,
          description,
          basePrice: parsedBasePrice,
          isSale,
          salePrice: isSale ? parsedSalePrice : null,
          category: { connect: { id: categoryId } },
          ...(subCategoryId && subCategoryId !== 'none'
            ? { subCategory: { connect: { id: subCategoryId } } }
            : { subCategory: { disconnect: true } }),
          ...(variantRecords.length > 0 && {
            variants: { create: variantRecords },
          }),
          shippingMethods: { create: shippingMethodRecords },
        },
      })
    })

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        images: true,
        shippingMethods: true,
        category: true,
        subCategory: true,
      },
    })

    const colorIdsRaw = formData.get('colorIds') as string | null
    const materialIdsRaw = formData.get('materialIds') as string | null
    const minOrderRaw = formData.get('minOrderQuantity') as string | null
    const inventoryRaw = formData.get('inventory') as string | null
    const specificationsRaw = formData.get('specifications') as string | null
    const colorIds = colorIdsRaw ? JSON.parse(colorIdsRaw) : []
    const materialIds = materialIdsRaw ? JSON.parse(materialIdsRaw) : []
    const minOrderQuantity = minOrderRaw ? parseInt(minOrderRaw, 10) : null
    const inventory = inventoryRaw ? parseInt(inventoryRaw, 10) : null
    const specifications = specificationsRaw ? JSON.parse(specificationsRaw) : []

    await saveProductAttributes(productId, {
      colorIds: Array.isArray(colorIds) ? colorIds : [],
      materialIds: Array.isArray(materialIds) ? materialIds : [],
      minOrderQuantity: minOrderQuantity && !Number.isNaN(minOrderQuantity) ? minOrderQuantity : null,
      inventory: inventory !== null && !Number.isNaN(inventory) ? inventory : null,
    })

    await saveProductSpecifications(
      productId,
      Array.isArray(specifications) ? specifications : []
    )

    return NextResponse.json(
      {
        message: 'Product updated successfully',
        product,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  return handleProductUpdate(req)
}

export async function POST(req: Request) {
  return handleProductUpdate(req)
}
