import prisma from '@/lib/prisma';

export type ProductAttributeInput = {
  colorIds?: string[];
  materialIds?: string[];
  minOrderQuantity?: number | null;
  inventory?: number | null;
};

export async function saveProductAttributes(productId: string, attrs: ProductAttributeInput) {
  const colorIds = attrs.colorIds || [];
  const materialIds = attrs.materialIds || [];
  const minOrderQuantity = attrs.minOrderQuantity ?? null;
  const inventory = attrs.inventory ?? null;

  await prisma.$executeRaw`
    UPDATE "Product"
    SET "minOrderQuantity" = ${minOrderQuantity},
        inventory = COALESCE(${inventory}, inventory),
        "updatedAt" = NOW()
    WHERE id = ${productId}
  `;

  await prisma.$executeRaw`DELETE FROM "ProductOnColor" WHERE "productId" = ${productId}`;
  for (const colorId of colorIds) {
    await prisma.$executeRaw`
      INSERT INTO "ProductOnColor" ("productId", "colorId") VALUES (${productId}, ${colorId})
      ON CONFLICT DO NOTHING
    `;
  }

  await prisma.$executeRaw`DELETE FROM "ProductOnMaterial" WHERE "productId" = ${productId}`;
  for (const materialId of materialIds) {
    await prisma.$executeRaw`
      INSERT INTO "ProductOnMaterial" ("productId", "materialId") VALUES (${productId}, ${materialId})
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function loadProductAttributes(productId: string) {
  const rows = await prisma.$queryRaw<
    { minOrderQuantity: number | null; inventory: number | null }[]
  >`
    SELECT "minOrderQuantity", inventory FROM "Product" WHERE id = ${productId} LIMIT 1
  `;
  const colorRows = await prisma.$queryRaw<{ colorId: string }[]>`
    SELECT "colorId" FROM "ProductOnColor" WHERE "productId" = ${productId}
  `;
  const materialRows = await prisma.$queryRaw<{ materialId: string }[]>`
    SELECT "materialId" FROM "ProductOnMaterial" WHERE "productId" = ${productId}
  `;

  return {
    minOrderQuantity: rows[0]?.minOrderQuantity ?? null,
    inventory: rows[0]?.inventory ?? 0,
    colorIds: colorRows.map((r) => r.colorId),
    materialIds: materialRows.map((r) => r.materialId),
  };
}
