import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getValidImageFiles,
  uploadProductImages,
} from '@/lib/product-image-upload'
import { saveProductAttributes } from '@/lib/save-product-attributes'
import { saveProductSpecifications } from '@/lib/save-product-specifications'

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
  }

  try {
    const formData = await req.formData()

    // Extract product data
    const productName = formData.get('name') as string
    const categoryId = formData.get('categoryId') as string
    const subCategoryId = formData.get('subCategoryId') as string | null
    const productKeywords = formData.get('keywords') as string
    const description = formData.get('description') as string
    const basePrice = formData.get('basePrice') as string
    const isSale = formData.get('isSale') === 'true'
    const salePriceRaw = formData.get('salePrice') as string | null
    const sellerId = formData.get('sellerId') as string
    const variantsRaw = formData.get('variants') as string
    const shippingMethodsRaw = formData.get('shippingMethods') as string

    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      include: {
        sellerProfile: true,
      },
    })

    if (!seller) {
      return NextResponse.json(
        { message: 'Invalid seller ID - user does not exist' },
        { status: 400 }
      )
    }

    console.log('Seller found:', seller.id, seller.email)

    // Extract images
    const productImages = getValidImageFiles(formData)

    // Validate required fields
    if (
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

    if (productImages.length === 0) {
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

    // Process keywords
    const keywordsArray = productKeywords
      ? productKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
      : []

    const uploadResult = await uploadProductImages(productImages)
    if (uploadResult.error) {
      console.error('Upload errors:', uploadResult.error)
      return NextResponse.json(
        { error: `Image upload failed: ${uploadResult.error}` },
        { status: 500 }
      )
    }

    const imageUrls = uploadResult.urls

    let variants = undefined
    if (
      variantsRaw &&
      variantsRaw !== 'undefined' &&
      variantsRaw.trim() !== ''
    ) {
      try {
        const parsedVariants = JSON.parse(variantsRaw)
        console.log('Parsed variants:', parsedVariants)

        if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
          // Filter out variants with empty titles
          const validVariants = parsedVariants.filter(
            (variant) => variant && variant.title && variant.title.trim() !== ''
          )

          if (validVariants.length > 0) {
            // Create individual variant records for each option
            const variantRecords = []

            for (const variant of validVariants) {
              // Check if variant has options array
              if (variant.options && Array.isArray(variant.options)) {
                // Filter out empty option values
                const validOptions = variant.options.filter(
                  (option: { value: string }) =>
                    option && option.value && option.value.trim() !== ''
                )

                // Create a variant record for each option
                for (const option of validOptions) {
                  variantRecords.push({
                    title: variant.title,
                    option: option.value,
                    hasPrice: Boolean(option.hasPrice),
                    price:
                      option.hasPrice &&
                        option.price &&
                        !isNaN(parseFloat(option.price))
                        ? parseFloat(option.price)
                        : 0,
                    sku: option.sku || null,
                  })
                }
              } else {
                // Handle case where variant doesn't have options array
                // (fallback for backward compatibility)
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

            if (variantRecords.length > 0) {
              variants = {
                create: variantRecords,
              }
              console.log('Final variant records to create:', variantRecords)
            }
          }
        }
      } catch (error) {
        console.error('Error parsing variants:', error)
        return NextResponse.json(
          { error: 'Invalid variants format' },
          { status: 400 }
        )
      }
    }

    // Ensure sellerProfile and its id exist before proceeding
    if (!seller.sellerProfile || !seller.sellerProfile.id) {
      return NextResponse.json(
        { error: 'Seller profile is missing or invalid' },
        { status: 400 }
      )
    }

    // Process shipping methods
    let shippingMethods
    if (
      shippingMethodsRaw &&
      shippingMethodsRaw !== 'undefined' &&
      shippingMethodsRaw.trim() !== ''
    ) {
      try {
        const parsedShippingMethods = JSON.parse(shippingMethodsRaw)
        console.log('Parsed shipping methods:', parsedShippingMethods)

        if (
          Array.isArray(parsedShippingMethods) &&
          parsedShippingMethods.length > 0
        ) {
          const validShippingMethods = parsedShippingMethods.filter(
            (method) =>
              method &&
              method.name &&
              method.name.trim() !== '' &&
              method.estimatedDays &&
              method.estimatedDays.trim() !== '' &&
              typeof method.price === 'number' &&
              method.price >= 0
          )

          if (validShippingMethods.length > 0) {
            const shippingMethodRecords = validShippingMethods.map(
              (method) => ({
                name: method.name.trim(),
                price: parseFloat(method.price) || 0,
                estimatedDays: method.estimatedDays.trim(),
                description: method.description
                  ? method.description.trim()
                  : null,
                isActive: Boolean(method.isActive),
              })
            )

            shippingMethods = {
              create: shippingMethodRecords,
            }
            console.log(
              'Final shipping method records to create:',
              shippingMethodRecords
            )
          }
        }
      } catch (error) {
        console.error('Error parsing shipping methods:', error)
        return NextResponse.json(
          { error: 'Invalid shipping methods format' },
          { status: 400 }
        )
      }
    }

    // Validate at least one shipping method is provided
    if (!shippingMethods) {
      return NextResponse.json(
        { error: 'At least one valid shipping method is required' },
        { status: 400 }
      )
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name: productName,
        status: 'pending',
        isActive: false,
        keywords: keywordsArray,
        description,
        category: { connect: { id: categoryId } },
        ...(subCategoryId && subCategoryId !== 'none' && {
          subCategory: { connect: { id: subCategoryId } }
        }),
        basePrice: parsedBasePrice,
        isSale,
        salePrice: isSale ? parsedSalePrice : null,
        seller: { connect: { id: seller.sellerProfile.id } },
        images: {
          create: imageUrls.map((url, index) => ({
            urlpath: url,
            isDefault: index === 0, // Set first image as default
          })),
        },
        ...(variants && { variants }),
        ...(shippingMethods && { shippingMethods }),
      },
      include: {
        variants: true,
        images: true,
        shippingMethods: true,
        category: true,
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
    const inventory = inventoryRaw ? parseInt(inventoryRaw, 10) : 0
    const specifications = specificationsRaw ? JSON.parse(specificationsRaw) : []

    await saveProductAttributes(product.id, {
      colorIds: Array.isArray(colorIds) ? colorIds : [],
      materialIds: Array.isArray(materialIds) ? materialIds : [],
      minOrderQuantity: minOrderQuantity && !Number.isNaN(minOrderQuantity) ? minOrderQuantity : null,
      inventory: !Number.isNaN(inventory) ? inventory : 0,
    })

    await saveProductSpecifications(
      product.id,
      Array.isArray(specifications) ? specifications : []
    )

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product: {
          id: product.id,
          name: product.name,
          category: product.category?.name,
          basePrice: product.basePrice,
          imageUrls: imageUrls,
          variants: product.variants,
          images: product.images,
          shippingMethods: product.shippingMethods,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        error:
          process.env.NODE_ENV === 'development' &&
            error &&
            typeof error === 'object' &&
            'message' in error
            ? (error as { message: string }).message
            : undefined,
      },
      { status: 500 }
    )
  }
}
