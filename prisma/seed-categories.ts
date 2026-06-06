import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const data = [
  {
    name: 'Home & Garden',
    subCategories: ['Furniture', 'Kitchenware', 'Home Decor', 'Tools'],
  },
  {
    name: 'Electronics',
    subCategories: ['Smartphones', 'Laptops & Computers', 'Audio & Video', 'Cameras'],
  },
  {
    name: 'Apparel & Fashion',
    subCategories: ["Men's Clothing", "Women's Clothing", 'Shoes', 'Outerwear'],
  },
  {
    name: 'Accessories',
    subCategories: ['Jewelry', 'Watches', 'Bags & Luggage', 'Sunglasses'],
  },
  {
    name: 'Sports & Entertainment',
    subCategories: ['Fitness & Bodybuilding', 'Outdoor Sports', 'Team Sports', 'Water Sports'],
  },
  {
    name: 'Mother & Kids',
    subCategories: ['Baby Care', 'Maternity', 'Kids Clothing', 'Baby Toys'],
  },
  {
    name: 'Beauty & Health',
    subCategories: ['Skincare', 'Makeup', 'Personal Care', 'Fragrances'],
  },
  {
    name: 'Toys & Games',
    subCategories: ['Action Figures', 'Board Games', 'Puzzles', 'Educational Toys'],
  },
  {
    name: 'Automobiles',
    subCategories: ['Car Electronics', 'Interior Accessories', 'Exterior Accessories', 'Tools & Maintenance'],
  },
];

async function main() {
  console.log('Start seeding categories...');
  for (const cat of data) {
    // Check if category exists
    let dbCat = await prisma.category.findUnique({
      where: { name: cat.name },
    });

    if (!dbCat) {
      console.log(`Creating category: ${cat.name}`);
      dbCat = await prisma.category.create({
        data: {
          name: cat.name,
          isActive: true,
          isTrending: false,
        },
      });
    } else {
      console.log(`Category already exists: ${cat.name}`);
    }

    // Seed subcategories
    for (const subName of cat.subCategories) {
      const dbSub = await prisma.subCategory.findFirst({
        where: { name: subName, categoryId: dbCat.id },
      });

      if (!dbSub) {
        console.log(`  Creating subcategory: ${subName}`);
        await prisma.subCategory.create({
          data: {
            name: subName,
            categoryId: dbCat.id,
            isActive: true,
            isTrending: false,
          },
        });
      } else {
        console.log(`  Subcategory already exists: ${subName}`);
      }
    }
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
