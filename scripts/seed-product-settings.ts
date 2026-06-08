import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const defaultColors = [
  { name: 'Black', hexCode: '#000000' },
  { name: 'Blue', hexCode: '#2563eb' },
  { name: 'Red', hexCode: '#dc2626' },
  { name: 'Silver', hexCode: '#c0c0c0' },
  { name: 'White', hexCode: '#ffffff' },
  { name: 'Yellow', hexCode: '#eab308' },
];

const defaultMaterials = ['Plastic', 'Silicone', 'Thermoplastic Polyurethane', 'Faux leather', 'Metal'];

async function upsertColor(name: string, hexCode: string) {
  const existing = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "ProductColor" WHERE name = ${name} LIMIT 1
  `;
  if (existing.length) return;
  await prisma.$executeRaw`
    INSERT INTO "ProductColor" (id, name, "hexCode", "isActive", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${name}, ${hexCode}, true, NOW(), NOW())
  `;
}

async function upsertMaterial(name: string) {
  const existing = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "ProductMaterial" WHERE name = ${name} LIMIT 1
  `;
  if (existing.length) return;
  await prisma.$executeRaw`
    INSERT INTO "ProductMaterial" (id, name, "isActive", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${name}, true, NOW(), NOW())
  `;
}

async function main() {
  console.log('Seeding product settings...');

  for (const c of defaultColors) {
    await upsertColor(c.name, c.hexCode);
  }
  for (const m of defaultMaterials) {
    await upsertMaterial(m);
  }

  const subCategories = await prisma.subCategory.findMany({ where: { isActive: true } });
  const brandNames = ['boAt', 'JBL', 'realme', 'SONY', 'ZEBRONICS', 'Noise'];

  for (const sub of subCategories.slice(0, 3)) {
    for (const brandName of brandNames) {
      const existing = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Brand" WHERE name = ${brandName} AND "subCategoryId" = ${sub.id} LIMIT 1
      `;
      if (existing.length) continue;
      await prisma.$executeRaw`
        INSERT INTO "Brand" (id, name, "subCategoryId", "isActive", "createdAt", "updatedAt")
        VALUES (${randomUUID()}, ${brandName}, ${sub.id}, true, NOW(), NOW())
      `;
    }
  }

  console.log('Product settings seed completed.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
