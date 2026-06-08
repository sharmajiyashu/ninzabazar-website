import prisma from '@/lib/prisma';

type LandingSectionRow = {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  isVisible: boolean;
  sortOrder: number;
  config: unknown;
};

type LandingDealRow = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  bgColor: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

type LandingCategorySlotRow = {
  id: string;
  categoryId: string;
  slotType: string;
  sortOrder: number;
  isActive: boolean;
};

type LandingProductSlotRow = {
  id: string;
  productId: string;
  sectionKey: string;
  sortOrder: number;
  isActive: boolean;
};

function hasLandingModels() {
  return typeof (prisma as { landingSection?: { findMany?: unknown } }).landingSection?.findMany === 'function';
}

export async function fetchLandingSections(): Promise<LandingSectionRow[]> {
  if (hasLandingModels()) {
    return prisma.landingSection.findMany({ orderBy: { sortOrder: 'asc' } });
  }
  return prisma.$queryRaw<LandingSectionRow[]>`
    SELECT id, key, title, subtitle, "isVisible", "sortOrder", config
    FROM "LandingSection"
    ORDER BY "sortOrder" ASC
  `;
}

export async function fetchLandingDeals(activeOnly = true): Promise<LandingDealRow[]> {
  if (hasLandingModels()) {
    return prisma.landingDeal.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }
  if (activeOnly) {
    return prisma.$queryRaw<LandingDealRow[]>`
      SELECT id, title, description, "imageUrl", "bgColor", "linkUrl", "sortOrder", "isActive"
      FROM "LandingDeal"
      WHERE "isActive" = true
      ORDER BY "sortOrder" ASC
    `;
  }
  return prisma.$queryRaw<LandingDealRow[]>`
    SELECT id, title, description, "imageUrl", "bgColor", "linkUrl", "sortOrder", "isActive"
    FROM "LandingDeal"
    ORDER BY "sortOrder" ASC
  `;
}

export async function fetchLandingCategorySlots() {
  if (hasLandingModels()) {
    return prisma.landingCategorySlot.findMany({
      where: { isActive: true },
      include: {
        category: {
          include: {
            subCategories: { where: { isActive: true }, orderBy: { name: 'asc' } },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  const slots = await prisma.$queryRaw<LandingCategorySlotRow[]>`
    SELECT id, "categoryId", "slotType", "sortOrder", "isActive"
    FROM "LandingCategorySlot"
    WHERE "isActive" = true
    ORDER BY "sortOrder" ASC
  `;

  if (slots.length === 0) return [];

  const categoryIds = [...new Set(slots.map((s) => s.categoryId))];
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds }, isActive: true },
    include: { subCategories: { where: { isActive: true }, orderBy: { name: 'asc' } } },
  });
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  return slots
    .map((slot) => ({
      ...slot,
      category: categoryMap[slot.categoryId],
    }))
    .filter((slot) => slot.category);
}

export async function fetchLandingProductSlots() {
  if (hasLandingModels()) {
    return prisma.landingProductSlot.findMany({
      where: { isActive: true },
      include: {
        product: {
          include: {
            images: { orderBy: { isDefault: 'desc' } },
            category: { select: { name: true } },
            variants: { select: { price: true } },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  const slots = await prisma.$queryRaw<LandingProductSlotRow[]>`
    SELECT id, "productId", "sectionKey", "sortOrder", "isActive"
    FROM "LandingProductSlot"
    WHERE "isActive" = true
    ORDER BY "sortOrder" ASC
  `;

  if (slots.length === 0) return [];

  const productIds = [...new Set(slots.map((s) => s.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      images: { orderBy: { isDefault: 'desc' } },
      category: { select: { name: true } },
      variants: { select: { price: true } },
    },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  return slots.map((slot) => ({
    ...slot,
    product: productMap[slot.productId] || null,
  }));
}
