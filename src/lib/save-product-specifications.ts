import prisma from '@/lib/prisma'

export type ProductSpecInput = {
  key: string
  value: string
}

export async function saveProductSpecifications(
  productId: string,
  specs: ProductSpecInput[]
) {
  const valid = specs
    .map((s, i) => ({
      key: s.key?.trim() || '',
      value: s.value?.trim() || '',
      sortOrder: i,
    }))
    .filter((s) => s.key && s.value)

  try {
    await prisma.productSpecification.deleteMany({ where: { productId } })
    if (valid.length > 0) {
      await prisma.productSpecification.createMany({
        data: valid.map((s) => ({
          productId,
          key: s.key,
          value: s.value,
          sortOrder: s.sortOrder,
        })),
      })
    }
    return
  } catch {
    await prisma.$executeRaw`DELETE FROM "ProductSpecification" WHERE "productId" = ${productId}`
    for (const spec of valid) {
      const id = crypto.randomUUID()
      await prisma.$executeRaw`
        INSERT INTO "ProductSpecification" (id, "productId", key, value, "sortOrder", "createdAt", "updatedAt")
        VALUES (${id}, ${productId}, ${spec.key}, ${spec.value}, ${spec.sortOrder}, NOW(), NOW())
      `
    }
  }
}

export async function loadProductSpecifications(productId: string) {
  try {
    const rows = await prisma.productSpecification.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, key: true, value: true, sortOrder: true },
    })
    return rows
  } catch {
    const rows = await prisma.$queryRaw<
      { id: string; key: string; value: string; sortOrder: number }[]
    >`
      SELECT id, key, value, "sortOrder"
      FROM "ProductSpecification"
      WHERE "productId" = ${productId}
      ORDER BY "sortOrder" ASC
    `
    return rows
  }
}
