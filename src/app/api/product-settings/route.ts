import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function trimName(value: string | null) {
  return value?.trim().replace(/\+/g, ' ') || '';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = trimName(searchParams.get('category'));

    const [colors, materials, categories] = await Promise.all([
      prisma.productColor.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.productMaterial.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          subCategories: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, imageUrl: true, categoryId: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    const activeCategory = categoryName
      ? categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase())
      : null;

    const subCategories = activeCategory?.subCategories || [];

    return NextResponse.json({
      subCategories,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        imageUrl: c.imageUrl,
        subCategories: c.subCategories,
      })),
      colors,
      materials,
    });
  } catch (error) {
    console.error('Error fetching product settings:', error);
    return NextResponse.json({ subCategories: [], categories: [], colors: [], materials: [] });
  }
}
