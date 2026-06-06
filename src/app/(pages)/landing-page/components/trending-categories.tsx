'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface SubCategory {
  id: string;
  name: string;
  imageUrl: string | null;
  category: {
    name: string;
  };
}

const TrendingCategories = () => {
  const [trending, setTrending] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/categories');
        const categories = await res.json();

        let trendingSubcategories: SubCategory[] = [];

        if (Array.isArray(categories)) {
          categories.forEach((cat: any) => {
            if (cat.subCategories && Array.isArray(cat.subCategories)) {
              cat.subCategories.forEach((sub: any) => {
                if (sub.isTrending && sub.isActive) {
                  trendingSubcategories.push({
                    id: sub.id,
                    name: sub.name,
                    imageUrl: sub.imageUrl,
                    category: { name: cat.name }
                  });
                }
              });
            }
          });
        }

        setTrending(trendingSubcategories);
      } catch (err) {
        console.error('Failed to fetch trending categories', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (trending.length === 0) {
    return null; // Don't show the section if no trending items
  }

  return (
    <div className="py-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 my-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Trending Categories
          </h2>
          <p className="text-gray-500 mt-2">Discover what's popular right now</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {trending.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col items-center cursor-pointer transition-all duration-300"
          >
            {/* Arch Background Container */}
            <div className="relative w-28 h-24 md:w-36 md:h-28 mt-6">
              {/* The Arch Shape */}
              <div className="absolute inset-0 bg-[#a7ebd1] rounded-t-[100px] shadow-sm"></div>

              {/* The Floating Image */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-28 md:w-32 md:h-36 flex items-end justify-center pb-1">
                {item.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-contain object-bottom group-hover:-translate-y-2 transition-transform duration-300 drop-shadow-md"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white text-gray-400 font-bold text-xl shadow mb-4">
                    {item.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 text-center">
              <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                {item.category.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingCategories;
