import { DealsCardProps } from '@/app/types/type'
import Image from 'next/image'
import React from 'react'

const DealsCard: React.FC<DealsCardProps> = ({
  title,
  description,
  image,
  altImage,
  bgColor,
}) => {
  return (
    <div
      className={`w-full max-w-[270px] aspect-[3/4] flex flex-col p-7 gap-y-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer select-none ${bgColor}`}
    >
      <div className="flex-1 min-h-0">
        <h3 className="text-white font-extrabold text-2xl mb-1">{title}</h3>
        <p className="text-white/95 text-xs font-semibold leading-relaxed">{description}</p>
      </div>
      <div className="flex justify-center items-center flex-1">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <Image src={image} alt={altImage} width={200} height={200} className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]" />
        </div>
      </div>
    </div>

  )
}

export default DealsCard
