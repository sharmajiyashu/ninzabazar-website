import prisma from '@/lib/prisma'
import { liveProductWhere } from '@/lib/product-status'

export async function fetchSearchProducts(q: string) {
  if (!q || q.trim() === '') {
    return []
  }

  try {
    const lowercaseQuery = q.toLowerCase().trim()

    // Search for actual products, not just keywords
    const products = await prisma.product.findMany({
      where: {
        AND: [
          liveProductWhere(),
          {
            OR: [
              {
                keywords: {
                  has: lowercaseQuery,
                },
              },
              {
                name: {
                  contains: lowercaseQuery,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: lowercaseQuery,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      select: {
        name: true,
        keywords: true,
      },
    })

    // Additional filtering for partial keyword matches
    const filteredProducts = products.filter((product) => {
      const keywordMatch = product.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(lowercaseQuery)
      )
      const nameMatch = product.name.toLowerCase().includes(lowercaseQuery)
      return keywordMatch || nameMatch
    })

    // Extract unique search suggestions
    const suggestions = new Set<string>()

    filteredProducts.forEach((product) => {
      // Add product name if it matches
      if (product.name.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(product.name)
      }

      // Add matching keywords
      product.keywords?.forEach((keyword) => {
        if (keyword.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(keyword)
        }
      })
    })

    // Convert to array and sort
    const sortedSuggestions = Array.from(suggestions).sort((a, b) => {
      // Exact matches first
      if (a.toLowerCase() === lowercaseQuery) return -1
      if (b.toLowerCase() === lowercaseQuery) return 1

      // Starts with query next
      const aStarts = a.toLowerCase().startsWith(lowercaseQuery)
      const bStarts = b.toLowerCase().startsWith(lowercaseQuery)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1

      // Alphabetical order
      return a.localeCompare(b)
    })

    // Return only top 10 suggestions
    return sortedSuggestions.slice(0, 10)
  } catch (error) {
    console.log('Search error:', error)
    return []
  }
}

export async function fetchProductsID(productID: string) {
  return await prisma.product.findFirst({
    where: {
      id: productID,
      ...liveProductWhere(),
    },
  })
}

export async function fetchQueryProducts(query: string) {
  const lowercaseQuery = query.toLowerCase().trim()
  return await prisma.product.findMany({
    where: {
      AND: [
        liveProductWhere(),
        {
          OR: [
            {
              keywords: {
                has: lowercaseQuery,
              },
            },
            {
              name: {
                contains: lowercaseQuery,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: lowercaseQuery,
                mode: 'insensitive',
              },
            },
          ],
        },
      ],
    },
    include: {
      images: {
        select: {
          urlpath: true,
          isDefault: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  })
}

const productListInclude = {
  images: {
    select: {
      urlpath: true,
      isDefault: true,
    },
  },
  reviews: {
    select: {
      rating: true,
    },
  },
  variants: { select: { price: true, hasPrice: true } },
  category: { select: { id: true, name: true } },
  subCategory: { select: { id: true, name: true } },
} as const

const productListIncludeWithAttributes = {
  ...productListInclude,
  productColors: { include: { color: { select: { id: true, name: true, hexCode: true } } } },
  productMaterials: { include: { material: { select: { id: true, name: true } } } },
} as const

function normalizeName(name?: string | null) {
  return name?.trim().replace(/\+/g, ' ') || ''
}

function buildAttributeFilters(filters?: {
  colorIds?: string[]
  materialIds?: string[]
  minOrder?: number | null
}) {
  return {
    ...(filters?.minOrder && { minOrderQuantity: { lte: filters.minOrder } }),
    ...(filters?.colorIds?.length && {
      productColors: { some: { colorId: { in: filters.colorIds } } },
    }),
    ...(filters?.materialIds?.length && {
      productMaterials: { some: { materialId: { in: filters.materialIds } } },
    }),
  }
}

function buildSubCategoryFilter(subCategory?: string, subCategoryNames?: string[]) {
  const names = subCategoryNames?.map(normalizeName).filter(Boolean) || []
  const single = normalizeName(subCategory)
  if (names.length > 0) {
    return { subCategory: { name: { in: names, mode: 'insensitive' as const } } }
  }
  if (single) {
    return { subCategory: { name: { equals: single, mode: 'insensitive' as const } } }
  }
  return {}
}

function hasAttributeRelations() {
  return typeof (prisma as { brand?: { findMany?: unknown } }).brand?.findMany === 'function'
}

async function findProductsWithListInclude(where: object) {
  try {
    return await prisma.product.findMany({
      where,
      include: hasAttributeRelations() ? productListIncludeWithAttributes : productListInclude,
    })
  } catch {
    return await prisma.product.findMany({ where, include: productListInclude })
  }
}

export async function fetchCategoryProducts(
  category: string,
  subCategory?: string | null,
  filters?: {
    subCategoryNames?: string[];
    colorIds?: string[];
    materialIds?: string[];
    minOrder?: number | null;
  }
) {
  const cat = normalizeName(category)
  return findProductsWithListInclude({
    category: { name: { equals: cat, mode: 'insensitive' } },
    ...buildSubCategoryFilter(subCategory || undefined, filters?.subCategoryNames),
    ...liveProductWhere(),
    ...buildAttributeFilters(filters),
  })
}

export async function fetchFilteredProducts(params: {
  query?: string;
  category?: string;
  subCategory?: string;
  subCategoryNames?: string[];
  colorIds?: string[];
  materialIds?: string[];
  minOrder?: number | null;
}) {
  const { query, category, subCategory, subCategoryNames, colorIds, materialIds, minOrder } = params;

  const filterWhere = {
    ...liveProductWhere(),
    ...buildAttributeFilters({ colorIds, materialIds, minOrder }),
  };

  const cat = normalizeName(category)

  if (cat) {
    return findProductsWithListInclude({
      category: { name: { equals: cat, mode: 'insensitive' } },
      ...buildSubCategoryFilter(subCategory, subCategoryNames),
      ...filterWhere,
    });
  }

  if (query) {
    const lowercaseQuery = query.toLowerCase().trim();
    return findProductsWithListInclude({
      ...filterWhere,
      OR: [
        { keywords: { has: lowercaseQuery } },
        { name: { contains: lowercaseQuery, mode: 'insensitive' } },
        { description: { contains: lowercaseQuery, mode: 'insensitive' } },
      ],
    });
  }

  return findProductsWithListInclude(filterWhere);
}

export async function fetchSellerProducts(sellerId: string) {
  return await prisma.product.findMany({
    where: {
      sellerId: sellerId,
      ...liveProductWhere(),
    },
    include: {
      images: {
        select: {
          urlpath: true,
          isDefault: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  })
}
