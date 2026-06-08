import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

type SectionSeed = {
  key: string;
  title: string;
  subtitle?: string;
  sortOrder: number;
  config?: Record<string, unknown>;
};

const defaultSections: SectionSeed[] = [
  { key: 'top_categories', title: 'Top Categories', sortOrder: 1 },
  {
    key: 'hero',
    title: 'Hero Banner',
    sortOrder: 2,
    config: {
      headline: 'Buy & Sell Products\nAcross India',
      subtext: 'Connect with verified suppliers & distributors instantly.',
      ctaText: 'Buy Product',
      ctaLink: '/products',
      imageUrl: '/img/authentication/shopping_cart_3d.png',
      actionCards: [
        { title: 'Request for Quotation', bgColor: '#fce3f2', image: '/img/hero-cards/quotation_3d.png', link: '/products' },
        { title: 'Sell Your Products', bgColor: '#fdf0cd', image: '/img/hero-cards/sell_products_3d.png', link: '/seller/post' },
        { title: 'Grow Your Business', bgColor: '#ffd3d5', image: '/img/hero-cards/grow_business_3d.png', link: '/seller/dashboard' },
      ],
    },
  },
  { key: 'best_deals', title: "Today's Best Deals", sortOrder: 3 },
  { key: 'trending_categories', title: 'Trending Categories', subtitle: "Discover what's popular right now", sortOrder: 4 },
  { key: 'featured_products', title: 'Featured Products', sortOrder: 5 },
  { key: 'apparel_fashion', title: 'Apparel & Fashion', sortOrder: 6 },
  { key: 'air_cleaning', title: 'Air Cleaning Equipment', sortOrder: 7 },
  { key: 'sports_entertainment', title: 'Sports & Entertainment', sortOrder: 8 },
  { key: 'beauty_health', title: 'Beauty & Health', sortOrder: 9 },
  {
    key: 'contact_form',
    title: 'Have a Question?',
    subtitle: "If you're a buyer and have any queries, feel free to fill out the form. Our team will get back to you shortly.",
    sortOrder: 10,
  },
];

const defaultDeals = [
  { title: 'Small Appliances', description: 'Up to 40% off kitchen products', imageUrl: '/deals-mock.png', bgColor: '#0a8558', sortOrder: 1 },
  { title: 'Premium Beauty', description: 'Flat 25% Off Hair Care', imageUrl: '/deals-mock2.png', bgColor: '#ff7a22', sortOrder: 2 },
  { title: 'Indoor Furniture', description: 'Save up to 30% today', imageUrl: '/deals-mock3.png', bgColor: '#ffcd1f', sortOrder: 3 },
  { title: 'Gadget & Device', description: 'Upto 15k off on Tablets', imageUrl: '/deals-mock4.png', bgColor: '#4c8cf5', sortOrder: 4 },
];

async function upsertSection(section: SectionSeed) {
  const existing = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "LandingSection" WHERE key = ${section.key} LIMIT 1
  `;

  if (existing.length > 0) return;

  const configJson = section.config ? JSON.stringify(section.config) : null;
  await prisma.$executeRaw`
    INSERT INTO "LandingSection" (id, key, title, subtitle, "isVisible", "sortOrder", config, "createdAt", "updatedAt")
    VALUES (
      ${randomUUID()},
      ${section.key},
      ${section.title},
      ${section.subtitle ?? null},
      true,
      ${section.sortOrder},
      ${configJson}::jsonb,
      NOW(),
      NOW()
    )
  `;
}

async function upsertCategorySlot(categoryId: string, slotType: string, sortOrder: number) {
  const existing = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "LandingCategorySlot"
    WHERE "categoryId" = ${categoryId} AND "slotType" = ${slotType}
    LIMIT 1
  `;

  if (existing.length > 0) return;

  await prisma.$executeRaw`
    INSERT INTO "LandingCategorySlot" (id, "categoryId", "slotType", "sortOrder", "isActive", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${categoryId}, ${slotType}, ${sortOrder}, true, NOW(), NOW())
  `;
}

async function main() {
  console.log('Seeding landing page defaults...');

  for (const section of defaultSections) {
    await upsertSection(section);
  }

  const dealCountRows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM "LandingDeal"
  `;
  const dealCount = Number(dealCountRows[0]?.count ?? 0);

  if (dealCount === 0) {
    for (const deal of defaultDeals) {
      await prisma.$executeRaw`
        INSERT INTO "LandingDeal" (id, title, description, "imageUrl", "bgColor", "linkUrl", "sortOrder", "isActive", "createdAt", "updatedAt")
        VALUES (${randomUUID()}, ${deal.title}, ${deal.description}, ${deal.imageUrl}, ${deal.bgColor}, NULL, ${deal.sortOrder}, true, NOW(), NOW())
      `;
    }
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  for (let i = 0; i < categories.length; i++) {
    await upsertCategorySlot(categories[i].id, 'top', i);
  }

  const trendingNames = ['Electronics', 'Apparel & Fashion', 'Accessories', 'Sports & Entertainment'];
  for (let i = 0; i < trendingNames.length; i++) {
    const cat = categories.find((c) => c.name === trendingNames[i]);
    if (cat) {
      await upsertCategorySlot(cat.id, 'trending', i);
    }
  }

  console.log('Landing page seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
