import Link from 'next/link'
import React from 'react'
import { Facebook, Linkedin, Twitter } from 'lucide-react'
import { toast } from 'sonner'


const Footer = () => {
  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 md:px-8 border-t border-gray-150 pt-8 pb-10 font-sans">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-10 w-full">
        {/* Left branding */}
        <div className="flex flex-col gap-2">
          <Link href="/">
            <h1 className="text-[#006d44] font-black text-3xl">Ninja Bazaar</h1>
          </Link>
          <p className="text-orange font-bold text-base">
            Best Marketplace for Distributors
          </p>
          {/* Social Icons */}
          <div className="flex gap-4 mt-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-[#006d44] bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full transition-all">
              <Facebook size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-[#006d44] bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full transition-all">
              <Linkedin size={16} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-[#006d44] bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full transition-all">
              <Twitter size={16} />
            </a>
          </div>
        </div>

        {/* Right columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12 w-full lg:w-auto">
          {/* Get Support */}
          <div className="flex flex-col gap-3">
            <h2 className="font-bold text-gray-800 text-sm">Get Support</h2>
            <ul className="space-y-2 flex flex-col">
              <li>
                <Link
                  href="/support/live-chat"
                  className="font-medium text-xs text-gray-500 hover:text-[#006d44] hover:underline"
                >
                  Live Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/support/order-status"
                  className="font-medium text-xs text-gray-500 hover:text-[#006d44] hover:underline"
                >
                  Check Order Status
                </Link>
              </li>
              <li>
                <Link
                  href="/support/report-abuse"
                  className="font-medium text-xs text-gray-500 hover:text-[#006d44] hover:underline"
                >
                  Report Abuse
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Protection */}
          <div className="flex flex-col gap-3">
            <h2 className="font-bold text-gray-800 text-sm">Payment & Protection</h2>
            <ul className="space-y-2 flex flex-col">
              <li>
                <Link
                  href="/protection/money-back"
                  className="font-medium text-xs text-gray-500 hover:text-[#006d44] hover:underline"
                >
                  Money-back policy
                </Link>
              </li>
              <li>
                <Link
                  href="/protection/shipping"
                  className="font-medium text-xs text-gray-500 hover:text-[#006d44] hover:underline"
                >
                  On-time shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/protection/payments"
                  className="font-medium text-xs text-gray-500 hover:text-[#006d44] hover:underline"
                >
                  Safe & Easy Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* Get to Know Us */}
          <div className="flex flex-col gap-3">
            <h2 className="font-bold text-gray-800 text-sm">Get to know us</h2>
            <ul className="space-y-2 flex flex-col">
              <li>
                <Link
                  href="/about"
                  className="font-medium text-xs text-gray-500 hover:text-[#006d44] hover:underline"
                >
                  About Ninja Bazaar
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/login"
                  className="font-medium text-xs text-gray-500 hover:text-[#006d44] hover:underline"
                >
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="font-medium text-xs text-gray-500 hover:text-[#006d44] hover:underline"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Privacy / Legal Links */}
      <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-center items-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        <Link href="/privacy" className="hover:text-gray-600 transition-colors">
          Privacy Policy
        </Link>
        <span className="hidden sm:inline text-gray-200">|</span>
        <Link href="/terms" className="hover:text-gray-600 transition-colors">
          Terms and Conditions
        </Link>
        <span className="hidden sm:inline text-gray-200">|</span>
        <button onClick={() => toast.info("Cookie Preferences loaded")} className="hover:text-gray-600 transition-colors uppercase cursor-pointer">
          Cookie Preferences
        </button>
      </div>
    </div>
  )
}

export default Footer

