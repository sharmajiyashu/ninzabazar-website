import prisma from '@/lib/prisma';
import { isProductLiveOnStore, liveProductWhere } from '@/lib/product-status';
import {
  fetchLandingCategorySlots,
  fetchLandingDeals,
  fetchLandingProductSlots,
  fetchLandingSections,
} from '@/lib/landing-page-db';

const productInclude = {
  images: { orderBy: { isDefault: 'desc' as const } },
  category: { select: { name: true } },
  variants: { select: { price: true } },
};

const defaultHero = {
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
};

const defaultDeals = [
  { id: '1', title: 'Small Appliances', description: 'Up to 40% off kitchen products', imageUrl: '/deals-mock.png', bgColor: '#0a8558', linkUrl: '/products', sortOrder: 1, isActive: true },
  { id: '2', title: 'Premium Beauty', description: 'Flat 25% Off Hair Care', imageUrl: '/deals-mock2.png', bgColor: '#ff7a22', linkUrl: '/products', sortOrder: 2, isActive: true },
  { id: '3', title: 'Indoor Furniture', description: 'Save up to 30% today', imageUrl: '/deals-mock3.png', bgColor: '#ffcd1f', linkUrl: '/products', sortOrder: 3, isActive: true },
  { id: '4', title: 'Gadget & Device', description: 'Upto 15k off on Tablets', imageUrl: '/deals-mock4.png', bgColor: '#4c8cf5', linkUrl: '/products', sortOrder: 4, isActive: true },
];

function parseSectionConfig(config: unknown): Record<string, unknown> {
  if (!config) return {};
  if (typeof config === 'string') {
    const trimmed = config.trim();
    if (!trimmed) return {};
    try {
      return JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof config === 'object') return config as Record<string, unknown>;
  return {};
}

function mergeHeroConfig(stored: unknown) {
  const parsed = parseSectionConfig(stored);
  const storedCards = Array.isArray(parsed.actionCards)
    ? (parsed.actionCards as typeof defaultHero.actionCards)
    : [];
  const actionCards =
    storedCards.length > 0
      ? defaultHero.actionCards.map((defaultCard, i) => ({
          ...defaultCard,
          ...(storedCards[i] || {}),
        }))
      : defaultHero.actionCards;

  return {
    ...defaultHero,
    ...parsed,
    actionCards,
  };
}

async function fetchRandomLandingProducts(limit = 8) {
  const pool = await prisma.product.findMany({
    where: liveProductWhere(),
    include: productInclude,
    take: 80,
  });
  const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, limit);
  return shuffled.map(formatProduct);
}

function formatProduct(product: {
  id: string;
  name: string;
  basePrice: { toString(): string };
  salePrice: { toString(): string } | null;
  isSale: boolean;
  images: { urlpath: string; isDefault: boolean }[];
  category: { name: string } | null;
  variants: { price: { toString(): string } }[];
}) {
  const defaultImage = product.images.find((img) => img.isDefault) || product.images[0];
  const prices = [
    Number(product.basePrice),
    ...(product.isSale && product.salePrice ? [Number(product.salePrice)] : []),
    ...product.variants.map((v) => Number(v.price)),
  ].filter((p) => p > 0);

  const minPrice = prices.length ? Math.min(...prices) : Number(product.basePrice);
  const maxPrice = prices.length ? Math.max(...prices) : Number(product.basePrice);

  return {
    id: product.id,
    name: product.name,
    image: defaultImage?.urlpath || '/placeholder.png',
    priceRange:
      minPrice === maxPrice
        ? `₹${minPrice.toLocaleString('en-IN')}`
        : `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`,
    categoryName: product.category?.name || '',
    isSale: product.isSale,
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    basePrice: Number(product.basePrice),
    minOrderQuantity: (product as { minOrderQuantity?: number | null }).minOrderQuantity ?? null,
  };
}

export async function getLandingPageData() {
  try {
    const [sections, deals, categorySlots, productSlots, allCategories] = await Promise.all([
      fetchLandingSections(),
      fetchLandingDeals(true),
      fetchLandingCategorySlots(),
      fetchLandingProductSlots(),
      prisma.category.findMany({
        where: { isActive: true },
        include: { subCategories: { where: { isActive: true }, orderBy: { name: 'asc' } } },
        orderBy: { name: 'asc' },
      }),
    ]);

    const sectionMap = Object.fromEntries(
      sections.map((s) => [
        s.key,
        { ...s, config: parseSectionConfig(s.config) },
      ])
    );

    const topSlots = categorySlots.filter((s) => s.slotType === 'top' && s.category?.isActive);
    const trendingSlots = categorySlots.filter((s) => s.slotType === 'trending' && s.category?.isActive);

    const topCategories = topSlots.length > 0 ? topSlots.map((s) => s.category!) : allCategories;
    const trendingCategories =
      trendingSlots.length > 0
        ? trendingSlots.map((s) => s.category!)
        : allCategories.filter((c) => c.isTrending);

    const productSections: Record<string, ReturnType<typeof formatProduct>[]> = {};
    for (const slot of productSlots) {
      const product = slot.product;
      if (!product || !isProductLiveOnStore(product.status, product.adminApproved, product.isActive)) continue;
      if (!productSections[slot.sectionKey]) productSections[slot.sectionKey] = [];
      productSections[slot.sectionKey].push(formatProduct(product));
    }

    const productSectionKeys = [
      'featured_products',
      'apparel_fashion',
      'air_cleaning',
      'sports_entertainment',
      'beauty_health',
    ];

    const productSectionsWithMeta = await Promise.all(
      productSectionKeys.map(async (key) => {
        const assigned = productSections[key] || [];
        const products =
          assigned.length > 0 ? assigned : await fetchRandomLandingProducts(8);
        return {
          key,
          title: sectionMap[key]?.title || key.replace(/_/g, ' '),
          subtitle: sectionMap[key]?.subtitle || null,
          isVisible: sectionMap[key]?.isVisible ?? true,
          products,
        };
      })
    ).then((sections) => sections.filter((s) => s.isVisible));

    const heroSection = sectionMap.hero;
    const heroConfig = mergeHeroConfig(heroSection?.config);

    return {
      sections: sectionMap,
      hero: heroConfig,
      topCategoriesTitle: sectionMap.top_categories?.title || 'Top Categories',
      topCategories,
      allCategories,
      trendingCategoriesTitle: sectionMap.trending_categories?.title || 'Trending Categories',
      trendingCategoriesSubtitle: sectionMap.trending_categories?.subtitle || null,
      trendingCategories,
      showTrendingSection: sectionMap.trending_categories?.isVisible ?? true,
      bestDealsTitle: sectionMap.best_deals?.title || "Today's Best Deals",
      showBestDeals: sectionMap.best_deals?.isVisible ?? true,
      deals: deals.length > 0 ? deals : defaultDeals,
      productSections: productSectionsWithMeta,
      contactForm: {
        title: sectionMap.contact_form?.title || 'Have a Question?',
        subtitle: sectionMap.contact_form?.subtitle || '',
        isVisible: sectionMap.contact_form?.isVisible ?? true,
      },
    };
  } catch (error) {
    console.error('Landing page data error, using fallback:', error);

    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      include: { subCategories: { where: { isActive: true }, orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });

    const fallbackSections = await Promise.all(
      ['featured_products', 'apparel_fashion', 'air_cleaning', 'sports_entertainment', 'beauty_health'].map(
        async (key) => ({
          key,
          title: key.replace(/_/g, ' '),
          subtitle: null,
          isVisible: true,
          products: await fetchRandomLandingProducts(8),
        })
      )
    );

    return {
      sections: {},
      hero: defaultHero,
      topCategoriesTitle: 'Top Categories',
      topCategories: allCategories,
      allCategories,
      trendingCategoriesTitle: 'Trending Categories',
      trendingCategoriesSubtitle: null,
      trendingCategories: allCategories.filter((c) => c.isTrending),
      showTrendingSection: true,
      bestDealsTitle: "Today's Best Deals",
      showBestDeals: true,
      deals: defaultDeals,
      productSections: fallbackSections,
      contactForm: {
        title: 'Have a Question?',
        subtitle: '',
        isVisible: true,
      },
    };
  }
}

export type LandingPageData = Awaited<ReturnType<typeof getLandingPageData>>;
