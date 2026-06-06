'use client'

import { useState, useEffect } from 'react'

const AdsCarousel = () => {
  const ads = ['ADS 1', 'ADS 2', 'ADS 3']
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === ads.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [ads.length])

  return (
    <div className="w-auto h-100 bg-green rounded-lg flex flex-col justify-between overflow-hidden">
      {/* Ads Container */}
      <div className="flex-grow flex items-center justify-center">
        <div
          className="flex transition-transform duration-500 ease-in-out w-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {ads.map((ad, index) => (
            <div
              key={index}
              className="min-w-full flex justify-center items-center h-[100%] text-white text-3xl font-bold"
            >
              {ad}
            </div>
          ))}
        </div>
      </div>

      {/* White Dot Navigation Bar */}
      <div className="w-full bg-white py-4 flex justify-center rounded-b-lg">
        {ads.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 mx-2 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex ? 'bg-orange-500 w-2 h-2' : 'bg-gray-400'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default AdsCarousel
