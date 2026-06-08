import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Facebook, Linkedin, Twitter } from 'lucide-react'
import { toast } from 'sonner'

const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t border-[#DDDDDD] bg-white">
      <div className="page-container pb-10 pt-8 font-sans animate-fade-in-soft">
        <div className="mb-10 flex w-full flex-col items-start justify-between gap-8 lg:flex-row">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              aria-label="Ninja Bazaar — go to homepage"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <Image
                src="/img/authentication/shopping_cart_3d.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-3xl font-black text-[#006d44]">Ninja Bazaar</h1>
            </Link>
            <p className="text-base font-bold text-orange">
              Best Marketplace for Distributors
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-gray-100 p-2.5 text-gray-500 transition-all hover:bg-gray-200 hover:text-[#006d44]"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-gray-100 p-2.5 text-gray-500 transition-all hover:bg-gray-200 hover:text-[#006d44]"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-gray-100 p-2.5 text-gray-500 transition-all hover:bg-gray-200 hover:text-[#006d44]"
              >
                <Twitter size={16} />
              </a>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-3 lg:w-auto lg:gap-12">
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-gray-800">Get Support</h2>
              <ul className="flex flex-col space-y-2">
                <li>
                  <Link
                    href="/support/live-chat"
                    className="text-xs font-medium text-gray-500 hover:text-[#006d44] hover:underline"
                  >
                    Live Chat
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support/order-status"
                    className="text-xs font-medium text-gray-500 hover:text-[#006d44] hover:underline"
                  >
                    Check Order Status
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support/report-abuse"
                    className="text-xs font-medium text-gray-500 hover:text-[#006d44] hover:underline"
                  >
                    Report Abuse
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-gray-800">
                Payment & Protection
              </h2>
              <ul className="flex flex-col space-y-2">
                <li>
                  <Link
                    href="/protection/money-back"
                    className="text-xs font-medium text-gray-500 hover:text-[#006d44] hover:underline"
                  >
                    Money-back policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/protection/shipping"
                    className="text-xs font-medium text-gray-500 hover:text-[#006d44] hover:underline"
                  >
                    On-time shipping
                  </Link>
                </li>
                <li>
                  <Link
                    href="/protection/payments"
                    className="text-xs font-medium text-gray-500 hover:text-[#006d44] hover:underline"
                  >
                    Safe & Easy Payments
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
              <h2 className="text-sm font-bold text-gray-800">Get to know us</h2>
              <ul className="flex flex-col space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-xs font-medium text-gray-500 hover:text-[#006d44] hover:underline"
                  >
                    About Ninja Bazaar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/seller/login"
                    className="text-xs font-medium text-gray-500 hover:text-[#006d44] hover:underline"
                  >
                    Become a Vendor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-xs font-medium text-gray-500 hover:text-[#006d44] hover:underline"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 border-t border-gray-100 pt-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:flex-row sm:gap-6">
          <Link href="/privacy" className="transition-colors hover:text-gray-600">
            Privacy Policy
          </Link>
          <span className="hidden text-gray-200 sm:inline">|</span>
          <Link href="/terms" className="transition-colors hover:text-gray-600">
            Terms and Conditions
          </Link>
          <span className="hidden text-gray-200 sm:inline">|</span>
          <button
            onClick={() => toast.info('Cookie Preferences loaded')}
            className="cursor-pointer uppercase transition-colors hover:text-gray-600"
          >
            Cookie Preferences
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
