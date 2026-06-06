import prisma from '@/lib/prisma'

export async function fetchSearchProducts(q: string) {
  if (!q || q.trim() === '') {
    return []
  }

  try {
    const lowercaseQuery = q.toLowerCase().trim()

    // Search for actual products, not just keywords
    const products = await prisma.product.findMany({
      where: {
        status: 'approved',
        isActive: true,
        OR: [
          // Search in keywords array
          {
            keywords: {
              has: lowercaseQuery,
            },
          },
          // Search in product name
          {
            name: {
              contains: lowercaseQuery,
              mode: 'insensitive',
            },
          },
          // Search in description
          {
            description: {
              contains: lowercaseQuery,
              mode: 'insensitive',
            },
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
  return await prisma.product.findUnique({
    where: {
      id: productID,
      status: 'approved',
      isActive: true,
    },
  })
}

export async function fetchQueryProducts(query: string) {
  const lowercaseQuery = query.toLowerCase().trim()
  return await prisma.product.findMany({
    where: {
      status: 'approved',
      isActive: true,
      OR: [
        // If keywords is a single string field
        {
          keywords: {
            has: lowercaseQuery,
          },
        },
        // Also search in name for better results
        {
          name: {
            contains: lowercaseQuery,
            mode: 'insensitive',
          },
        },
        // Optionally search in description too
        {
          description: {
            contains: lowercaseQuery,
            mode: 'insensitive',
          },
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

export async function fetchCategoryProducts(category: string) {
  return await prisma.product.findMany({
    where: {
      category: category,
      status: 'approved',
      isActive: true,
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

export async function fetchSellerProducts(sellerId: string) {
  return await prisma.product.findMany({
    where: {
      sellerId: sellerId,
      status: 'approved',
      isActive: true,
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
