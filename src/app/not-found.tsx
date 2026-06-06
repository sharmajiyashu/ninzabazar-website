import React from 'react'
import Image from 'next/image'
import bg from '@/../public/img/authentication/bg.png'
import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="relative flex justify-center items-center overflow-x-hidden overflow-y-hidden">
      {/* Left Background */}
      {/* Desktop */}
      <div
        className="hidden md:block absolute -top-48 -left-64 bg-no-repeat bg-cover md:bg-cover"
        style={{ backgroundImage: `url(${bg.src})` }}
      >
        <Image src={bg} alt="bg" width={500} height={500} />
      </div>
      {/* Mobile */}
      <div
        className="block md:hidden absolute -top-40 -left-44 bg-no-repeat bg-cover md:bg-cover"
        style={{ backgroundImage: `url(${bg.src})` }}
      >
        <Image src={bg} alt="bg" width={300} height={300} />
      </div>

      {/* Right Background */}
      {/* Desktop */}
      <div
        className="hidden md:block absolute top-2/3 -right-56 bg-no-repeat bg-cover md:bg-cover"
        style={{ backgroundImage: `url(${bg.src})` }}
      >
        <Image src={bg} alt="bg" width={500} height={500} />
      </div>
      {/* Mobile */}
      <div
        className="block md:hidden absolute -bottom-40 -right-40 bg-no-repeat bg-cover md:bg-cover"
        style={{ backgroundImage: `url(${bg.src})` }}
      >
        <Image src={bg} alt="bg" width={300} height={300} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-8xl font-bold">404</h1>
        <p className="mt-4 text-5xl font-bold text-green">
          Sorry! This page isn&apos;t available
        </p>
        <p className="mt-2 text-lg text-disabledgrey">
          Go back to{' '}
          <Link href="/" className="text-green underline">
            Homepage
          </Link>{' '}
          or visit our{' '}
          <Link href="/help" className=" text-yellow underline">
            Help Center
          </Link>
        </p>
      </div>
    </div>
  )
}

export default NotFound
