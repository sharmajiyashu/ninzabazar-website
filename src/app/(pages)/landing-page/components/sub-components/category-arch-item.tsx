'use client'

import Image from 'next/image'
import Link from 'next/link'

export const ARCH_PALETTES = [
  { bg: '#a7ebd1', hover: '#8ee1c2' },
  { bg: '#b8dff5', hover: '#9dd4f0' },
  { bg: '#c5f0e8', hover: '#a8e8dc' },
  { bg: '#d4edf8', hover: '#bce4f5' },
] as const

type CategoryArchItemProps = {
  name: string
  imageUrl?: string | null
  href: string
  colorIndex?: number
  size?: 'sm' | 'lg'
}

export default function CategoryArchItem({
  name,
  imageUrl,
  href,
  colorIndex = 0,
  size = 'lg',
}: CategoryArchItemProps) {
  const palette = ARCH_PALETTES[colorIndex % ARCH_PALETTES.length]
  const isLarge = size === 'lg'

  return (
    <Link
      href={href}
      className="group flex flex-col items-center cursor-pointer transition-all duration-300 w-full"
    >
      <div
        className={`relative mx-auto ${
          isLarge ? 'w-full max-w-[200px] h-28 sm:h-32 md:h-36' : 'w-full max-w-[96px] h-20'
        }`}
      >
        <div
          className="absolute inset-0 rounded-t-[100px] shadow-sm transition-colors duration-300 group-hover:opacity-90"
          style={{ backgroundColor: palette.bg }}
        />
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end justify-center pb-1 ${
            isLarge ? 'w-[75%] h-[115%]' : 'w-16 h-20'
          }`}
        >
          {imageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes={isLarge ? '(max-width:768px) 140px, 200px' : '96px'}
                className="object-contain object-bottom transition-transform duration-300 group-hover:-translate-y-1.5 drop-shadow-md"
              />
            </div>
          ) : (
            <div
              className={`rounded-full flex items-center justify-center bg-white text-gray-400 font-bold shadow mb-2 group-hover:-translate-y-1 transition-transform ${
                isLarge ? 'w-16 h-16 md:w-20 md:h-20 text-xl' : 'w-12 h-12 text-sm'
              }`}
            >
              {name.charAt(0)}
            </div>
          )}
        </div>
      </div>
      <h3
        className={`font-semibold text-gray-800 group-hover:text-[#006d44] transition-colors text-center line-clamp-2 leading-snug ${
          isLarge ? 'mt-3 md:mt-4 text-sm md:text-base px-1' : 'mt-3 text-xs'
        }`}
      >
        {name}
      </h3>
    </Link>
  )
}
