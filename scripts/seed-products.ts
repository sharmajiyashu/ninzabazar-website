import { PrismaClient } from '@prisma/client'
import { saveProductSpecifications } from '../src/lib/save-product-specifications'

const prisma = new PrismaClient()

const FALLBACK_CATEGORIES = [
  { name: 'Electronics', subCategories: ['Smartphones', 'Laptops', 'Audio', 'Wearables'] },
  { name: 'Fashion', subCategories: ["Men's Clothing", "Women's Clothing", 'Shoes', 'Accessories'] },
  { name: 'Home & Living', subCategories: ['Furniture', 'Decor', 'Kitchenware', 'Bedding'] },
  { name: 'Health & Beauty', subCategories: ['Skincare', 'Makeup', 'Haircare', 'Personal Care'] },
  { name: 'Sports & Outdoors', subCategories: ['Fitness Equipment', 'Outdoor Gear', 'Sportswear', 'Cycling'] },
]

const PRODUCT_NAMES: Record<string, string[]> = {
  Smartphones: ['iPhone 14 Pro Max', 'Samsung Galaxy S23 Ultra', 'Google Pixel 7 Pro', 'OnePlus 11'],
  Laptops: ['MacBook Pro M2', 'Dell XPS 15', 'Lenovo ThinkPad X1', 'Asus ROG Zephyrus'],
  Audio: ['Sony WH-1000XM5', 'AirPods Pro 2', 'Bose QuietComfort 45', 'JBL Charge 5'],
  Wearables: ['Apple Watch Series 8', 'Samsung Galaxy Watch 5', 'Garmin Fenix 7', 'Fitbit Charge 5'],
  "Men's Clothing": ['Classic White T-Shirt', 'Denim Jacket', 'Slim Fit Jeans', 'Polo Shirt'],
  "Women's Clothing": ['Floral Summer Dress', 'High-Waisted Leggings', 'Knit Sweater', 'Leather Jacket'],
  Shoes: ['Nike Air Force 1', 'Adidas Ultraboost', 'Converse Chuck Taylor', 'Vans Old Skool'],
  Accessories: ['Leather Wallet', 'Aviator Sunglasses', 'Minimalist Watch', 'Canvas Backpack'],
  Furniture: ['Ergonomic Office Chair', 'Modern Sofa', 'Wooden Dining Table', 'TV Stand'],
  Decor: ['Abstract Wall Art', 'Indoor Potted Plant', 'Scented Candle Set', 'Decorative Throw Pillows'],
  Kitchenware: ['Non-Stick Pan Set', "Chef's Knife", 'Espresso Machine', 'Air Fryer'],
  Bedding: ['Memory Foam Mattress', 'Egyptian Cotton Sheets', 'Duvet Cover Set', 'Weighted Blanket'],
  Skincare: ['Hydrating Face Serum', 'SPF 50 Sunscreen', 'Vitamin C Moisturizer', 'Clay Face Mask'],
  Makeup: ['Matte Foundation', 'Liquid Eyeliner', 'Volumizing Mascara', 'Lip Tint'],
  Haircare: ['Argan Oil Shampoo', 'Leave-In Conditioner', 'Hair Styling Clay', 'Heat Protectant Spray'],
  'Personal Care': ['Electric Toothbrush', 'Body Wash', 'Deodorant Stick', 'Razor Set'],
  'Fitness Equipment': ['Adjustable Dumbbells', 'Yoga Mat', 'Resistance Bands', 'Jump Rope'],
  'Outdoor Gear': ['Camping Tent', 'Sleeping Bag', 'Hiking Backpack', 'Portable Stove'],
  Sportswear: ['Moisture-Wicking T-Shirt', 'Running Shorts', 'Compression Tights', 'Sports Bra'],
  Cycling: ['Mountain Bike', 'Cycling Helmet', 'Bike Lights', 'U-Lock'],
}

const DEFAULT_SPECS = [
  { key: 'Noise cancelling', value: 'Active Noise Cancellation (ANC)' },
  { key: 'BT Wireless', value: 'Bluetooth v5.4' },
  { key: 'Waterproof Standard', value: 'IPX-4' },
  { key: 'Material', value: 'Leather, Plastic' },
  { key: 'Battery Life', value: 'Up to 40 hours' },
  { key: 'Driver Size', value: '40mm' },
  { key: 'Weight', value: '250g' },
  { key: 'Warranty', value: '1 Year Manufacturer' },
]

const COLOR_SEED = [
  { name: 'White', hexCode: '#FFFFFF' },
  { name: 'Black', hexCode: '#1a1a1a' },
  { name: 'Blue', hexCode: '#2066d2' },
  { name: 'Red', hexCode: '#dc2626' },
  { name: 'Green', hexCode: '#006d44' },
]

function getProductName(subCategory: string, index: number): string {
  const names = PRODUCT_NAMES[subCategory]
  if (names?.length) return names[index % names.length]
  return `Premium ${subCategory} Item ${index + 1}`
}

function buildDescription(name: string, category: string, subCat: string) {
  return `${name} is a premium B2B listing in our ${category} / ${subCat} catalog. Built for distributors and retailers across India with verified quality, competitive bulk pricing, and reliable supply. Ideal for wholesale orders with flexible minimum order quantities. Contact the seller for custom quotations and long-term supply agreements.`
}

async function ensureColors() {
  const colors = []
  for (const c of COLOR_SEED) {
    const row = await prisma.productColor.upsert({
      where: { name: c.name },
      create: { name: c.name, hexCode: c.hexCode, isActive: true },
      update: { hexCode: c.hexCode },
    })
    colors.push(row)
  }
  return colors
}

async function main() {
  console.log('Deleting existing products...')
  try {
    await prisma.productSpecification.deleteMany({})
  } catch {
    await prisma.$executeRaw`DELETE FROM "ProductSpecification"`
  }
  await prisma.product.deleteMany({})

  const email = 'apoorva@gmail.com'
  const user = await prisma.user.findUnique({
    where: { email },
    include: { sellerProfile: { include: { registeredAddress: true } } },
  })

  if (!user?.sellerProfile) {
    console.error(`Seller ${email} not found`)
    return
  }

  const sellerId = user.sellerProfile.id

  await prisma.$executeRaw`
    UPDATE "SellerProfile"
    SET "gstNumber" = 'ABCDE1234F1Z5',
        description = ${'Established wholesale supplier serving distributors across India since 2010. We specialize in electronics, fashion, and lifestyle products with ISO-certified quality control and pan-India logistics support.'},
        "shopName" = COALESCE("shopName", ${user.sellerProfile.companyName}),
        "updatedAt" = NOW()
    WHERE id = ${sellerId}
  `

  if (!user.sellerProfile.registeredAddress) {
    await prisma.address.create({
      data: {
        street: 'Gat No. 639, H No 328, Hiware Tarfe, Narayangaon',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '410504',
        country: 'India',
        sellerProfileId: sellerId,
        label: 'Registered',
      },
    })
  }

  let dbCategories = await prisma.category.findMany({ include: { subCategories: true } })
  if (dbCategories.length === 0) {
    for (const cat of FALLBACK_CATEGORIES) {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          isActive: true,
          subCategories: { create: cat.subCategories.map((sc) => ({ name: sc, isActive: true })) },
        },
        include: { subCategories: true },
      })
      dbCategories.push(created)
    }
  }

  const colors = await ensureColors()
  console.log(`Ensured ${colors.length} colors`)

  const placeholder = '/placeholder.png'
  let created = 0

  for (let i = 0; i < 20; i++) {
    const categoryObj = dbCategories[i % dbCategories.length]
    const subCategories = categoryObj.subCategories || []
    const subCategoryObj = subCategories.length ? subCategories[i % subCategories.length] : null
    const subCatName = subCategoryObj?.name || 'General'
    const name = getProductName(subCatName, i)
    const basePrice = Math.floor(Math.random() * 4500) + 500
    const inventory = Math.floor(Math.random() * 450) + 50
    const minOrder = [50, 100, 200, 500][i % 4]

    const product = await prisma.product.create({
      data: {
        name,
        description: buildDescription(name, categoryObj.name, subCatName),
        sellerId,
        basePrice,
        categoryId: categoryObj.id,
        subCategoryId: subCategoryObj?.id ?? null,
        isSale: i % 5 === 0,
        salePrice: i % 5 === 0 ? Math.floor(basePrice * 0.85) : null,
        keywords: [categoryObj.name.toLowerCase(), subCatName.toLowerCase(), 'premium', 'wholesale'],
        isActive: true,
        adminApproved: true,
        status: 'approved',
        images: {
          create: [{ urlpath: placeholder, isDefault: true }],
        },
        shippingMethods: {
          create: [
            {
              name: 'Standard Delivery',
              price: 99,
              estimatedDays: '5-7 days',
              description: 'Pan-India shipping',
              isActive: true,
            },
          ],
        },
      },
    })

    await prisma.$executeRaw`
      UPDATE "Product"
      SET inventory = ${inventory}, "minOrderQuantity" = ${minOrder}, "updatedAt" = NOW()
      WHERE id = ${product.id}
    `

    const colorPick = [colors[i % colors.length], colors[(i + 1) % colors.length]]
    for (const color of colorPick) {
      await prisma.$executeRaw`
        INSERT INTO "ProductOnColor" ("productId", "colorId") VALUES (${product.id}, ${color.id})
        ON CONFLICT DO NOTHING
      `
    }

    await saveProductSpecifications(product.id, DEFAULT_SPECS)
    created++
  }

  console.log(`Seeded ${created} products with descriptions, inventory, colors, and specifications.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
