import { Star } from 'lucide-react'

export const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-3 w-3 lg:h-5 lg:w-5 ${
            index < Math.round(rating)
              ? 'fill-yellow text-yellow'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}
