'use client'
import { Fence, MonitorSmartphone, Shirt, Gem, Volleyball, Baby, Sparkles, Gamepad2, Car } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const Categories = () => {
  const categories = [
    { value: 'home-garden', icon: <Fence size={18} className="text-orange" />, name: 'Home & Garden' },
    { value: 'electronics', icon: <MonitorSmartphone size={18} className="text-blue-500" />, name: 'Electronics' },
    { value: 'fashion', icon: <Shirt size={18} className="text-teal-500" />, name: 'Apparel & Fashion' },
    { value: 'accessories', icon: <Gem size={18} className="text-purple-500" />, name: 'Accessories' },
    { value: 'sports-entertainment', icon: <Volleyball size={18} className="text-yellow-500" />, name: 'Sports & Entertainment' },
    { value: 'mother-kids', icon: <Baby size={18} className="text-pink-500" />, name: 'Mother & Kids' },
    { value: 'beauty-health', icon: <Sparkles size={18} className="text-red-400" />, name: 'Beauty & Health' },
    { value: 'toys-games', icon: <Gamepad2 size={18} className="text-indigo-500" />, name: 'Toys & Games' },
    { value: 'automobiles', icon: <Car size={18} className="text-emerald-500" />, name: 'Automobiles' },
  ]
  const router = useRouter()
  const handleSelectCategory = (category: string) => {
    router.push(`/products?category=${category}`)
  }
  return (
    <div>
      <div className="hidden lg:block">
        <div className="w-full md:w-64 bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
          <h1 className="font-bold mb-4 text-gray-800 text-lg">Top Categories</h1>
          <ul className="font-medium flex flex-col gap-y-3.5">
            {categories.map((category, index) => (
              <button
                key={index}
                className="flex gap-3 items-center text-gray-600 hover:text-green cursor-pointer transition-colors text-sm font-semibold"
                onClick={() => handleSelectCategory(category.value)}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </ul>
          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              onClick={() => router.push('/products')}
              className="text-green hover:text-green-800 font-bold text-sm underline cursor-pointer"
            >
              View all Categories
            </button>
          </div>
        </div>
      </div>

      <div className="block lg:hidden">
        <div className="py-4 px-3">
          <h1 className="font-bold mb-4 text-gray-800 text-lg">Top Categories</h1>
          <div className="flex overflow-x-auto space-x-4 no-scrollbar">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleSelectCategory(category.value)}
                className="flex items-center gap-2 whitespace-nowrap py-2.5 px-5 text-sm bg-gray-50 border border-gray-200 rounded-full text-gray-700 cursor-pointer transition-colors hover:bg-gray-100"
              >
                {category.icon} <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories

