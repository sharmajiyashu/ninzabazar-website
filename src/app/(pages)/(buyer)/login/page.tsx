'use client'
import React from 'react'
import Image from 'next/image'
import LoginForms from './forms'

const Page = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col md:flex-row bg-[#006d44] overflow-hidden font-sans">

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-animation {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        .animate-float {
          animation: float-animation 6s ease-in-out infinite;
        }
      `}} />

      {/* Left Side: 3D Illustration (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-12 relative z-10 select-none">
        <div className="animate-float relative w-full max-w-lg aspect-square flex items-center justify-center">
          <Image 
            src="/img/authentication/shopping_cart_3d.png" 
            alt="Ninja Bazaar Shopping Cart" 
            width={550} 
            height={550} 
            priority
            className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          />
        </div>
      </div>

      {/* Right Side: Login Card & Branding */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 min-h-screen md:min-h-0">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Logo / Branding */}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-wide drop-shadow-sm select-none">
            Ninja Bazaar
          </h1>

          {/* White login card */}
          <div className="w-full bg-white rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-white/10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back!
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Log in to your Ninja Bazaar
              </p>
            </div>

            <LoginForms />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page

